-- Migration 05: Create database functions and triggers

-- ─── search_nearby_places ────────────────────────────────────────────────────
-- Main geo search function using PostGIS + place_stats + pivot tables
-- Uses correlated subqueries for pivot aggregations to avoid cartesian products

-- Drop all overloads of this function before recreating with new signature
DROP FUNCTION IF EXISTS search_nearby_places(NUMERIC, NUMERIC, INTEGER, TEXT, TEXT, NUMERIC, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS search_nearby_places(NUMERIC, NUMERIC, INTEGER, TEXT, TEXT, TEXT, NUMERIC, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION search_nearby_places(
  p_lat        NUMERIC,
  p_lng        NUMERIC,
  p_radius_m   INTEGER DEFAULT 3000,
  p_meal_type  TEXT    DEFAULT NULL,
  p_cuisine    TEXT    DEFAULT NULL,
  p_food_type  TEXT    DEFAULT NULL,
  p_max_price  NUMERIC DEFAULT NULL,
  p_limit      INTEGER DEFAULT 20,
  p_offset     INTEGER DEFAULT 0
)
RETURNS TABLE (
  id                 UUID,
  name               TEXT,
  address            TEXT,
  numero             TEXT,
  complemento        TEXT,
  bairro             TEXT,
  cidade             TEXT,
  estado             TEXT,
  lat                NUMERIC,
  lng                NUMERIC,
  establishment_type TEXT,
  cuisine_types      TEXT[],
  meal_types         TEXT[],
  food_types         TEXT[],
  price_bucket       TEXT,
  median_price       NUMERIC,
  logo_url           TEXT,
  rating             NUMERIC,
  reviews_count      INTEGER,
  status             TEXT,
  created_by         UUID,
  created_at         TIMESTAMPTZ,
  updated_at         TIMESTAMPTZ,
  distance_m         NUMERIC
) AS $$
DECLARE
  v_point GEOGRAPHY := ST_SetSRID(ST_MakePoint(p_lng::FLOAT8, p_lat::FLOAT8), 4326)::GEOGRAPHY;
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.address,
    p.numero,
    p.complemento,
    p.bairro,
    p.cidade,
    p.estado,
    p.lat,
    p.lng,
    p.establishment_type::TEXT,
    (SELECT COALESCE(array_agg(pc.cuisine_type::TEXT ORDER BY pc.cuisine_type::TEXT), ARRAY[]::TEXT[])
     FROM place_cuisines pc WHERE pc.place_id = p.id) AS cuisine_types,
    (SELECT COALESCE(array_agg(pm.meal_type::TEXT ORDER BY pm.meal_type::TEXT), ARRAY[]::TEXT[])
     FROM place_meals pm WHERE pm.place_id = p.id) AS meal_types,
    (SELECT COALESCE(array_agg(pf.food_type::TEXT ORDER BY pf.food_type::TEXT), ARRAY[]::TEXT[])
     FROM place_food_types pf WHERE pf.place_id = p.id) AS food_types,
    p.price_bucket::TEXT,
    s.median_price,
    ph.url AS logo_url,
    COALESCE(s.rating, 0) AS rating,
    COALESCE(s.reviews_count, 0)::INTEGER AS reviews_count,
    p.status,
    p.created_by,
    p.created_at,
    p.updated_at,
    ST_Distance(p.location, v_point)::NUMERIC AS distance_m
  FROM places p
  LEFT JOIN place_stats s ON s.place_id = p.id
  LEFT JOIN LATERAL (
    SELECT url FROM place_photos
    WHERE place_id = p.id AND type = 'logo'
    ORDER BY position LIMIT 1
  ) ph ON true
  WHERE
    p.status = 'approved'
    AND ST_DWithin(p.location, v_point, p_radius_m) -- Uses GIST index
    AND (
      p_meal_type IS NULL
      OR EXISTS (
        SELECT 1 FROM place_meals pm2
        WHERE pm2.place_id = p.id AND pm2.meal_type::TEXT = p_meal_type
      )
    )
    AND (
      p_cuisine IS NULL
      OR EXISTS (
        SELECT 1 FROM place_cuisines pc2
        WHERE pc2.place_id = p.id AND pc2.cuisine_type::TEXT = p_cuisine
      )
    )
    AND (
      p_food_type IS NULL
      OR EXISTS (
        SELECT 1 FROM place_food_types pf2
        WHERE pf2.place_id = p.id AND pf2.food_type::TEXT = p_food_type
      )
    )
    AND (p_max_price IS NULL OR COALESCE(s.median_price, 9999) <= p_max_price)
  ORDER BY
    (
      (1.0 - LEAST(ST_Distance(p.location, v_point) / p_radius_m, 1.0)) * 0.4
      + (COALESCE(s.rating, 0) / 5.0) * 0.4
      + (LOG(GREATEST(COALESCE(s.reviews_count, 0)::NUMERIC, 1)) / 5.0) * 0.2
    ) DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_nearby_places IS
  'Reads from place_stats, place_cuisines, place_meals, place_food_types. '
  'Correlated subqueries for pivot aggregations avoid cartesian products. '
  'ST_DWithin in WHERE uses GIST index; ST_Distance only in SELECT/ORDER.';

-- ─── update_place_stats ──────────────────────────────────────────────────────
-- Trigger function to maintain place_stats on review insert/update/delete
CREATE OR REPLACE FUNCTION update_place_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_place_id     UUID;
  v_rating       NUMERIC(3, 2);
  v_count        INTEGER;
  v_thumbs_up    INTEGER;
  v_median       NUMERIC(8, 2);
BEGIN
  v_place_id := COALESCE(NEW.place_id, OLD.place_id);

  SELECT
    COALESCE(ROUND(AVG(rating::NUMERIC), 2), 0),
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE rating >= 4)::INTEGER,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_paid)
      FILTER (WHERE amount_paid IS NOT NULL)
  INTO v_rating, v_count, v_thumbs_up, v_median
  FROM reviews
  WHERE place_id = v_place_id;

  INSERT INTO place_stats (place_id, rating, reviews_count, thumbs_up_count, median_price)
  VALUES (v_place_id, v_rating, v_count, v_thumbs_up, v_median)
  ON CONFLICT (place_id) DO UPDATE SET
    rating          = EXCLUDED.rating,
    reviews_count   = EXCLUDED.reviews_count,
    thumbs_up_count = EXCLUDED.thumbs_up_count,
    median_price    = EXCLUDED.median_price,
    updated_at      = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: update stats on review changes
DROP TRIGGER IF EXISTS trigger_update_place_stats ON reviews;
CREATE TRIGGER trigger_update_place_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_place_stats();

-- ─── init_place_stats ────────────────────────────────────────────────────────
-- Initialize place_stats row when a new place is created
CREATE OR REPLACE FUNCTION init_place_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO place_stats (place_id, rating, reviews_count, thumbs_up_count)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: initialize stats on place creation
DROP TRIGGER IF EXISTS trigger_init_place_stats ON places;
CREATE TRIGGER trigger_init_place_stats
  AFTER INSERT ON places
  FOR EACH ROW EXECUTE FUNCTION init_place_stats();

-- ─── handle_new_user ─────────────────────────────────────────────────────────
-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_nick TEXT;
  final_nick TEXT;
  counter INT := 0;
BEGIN
  -- Derive nickname from email local part (before @)
  base_nick := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  IF base_nick = '' THEN base_nick := 'user'; END IF;

  -- Ensure uniqueness by appending counter if needed
  final_nick := base_nick;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE nickname = final_nick) LOOP
    counter := counter + 1;
    final_nick := base_nick || counter::TEXT;
  END LOOP;

  INSERT INTO profiles (id, nickname, email)
  VALUES (NEW.id, final_nick, NEW.email);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── award_review_points ─────────────────────────────────────────────────────
-- Gamification: award points when user creates a review
CREATE OR REPLACE FUNCTION award_review_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET points = points + 10
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: award points on review creation
DROP TRIGGER IF EXISTS trigger_award_review_points ON reviews;
CREATE TRIGGER trigger_award_review_points
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION award_review_points();

-- ─── increment_list_view_count ───────────────────────────────────────────────
-- Function to increment list view count (called from application layer)
CREATE OR REPLACE FUNCTION increment_list_view_count(list_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE lists
  SET view_count = view_count + 1
  WHERE id = list_uuid;
END;
$$ LANGUAGE plpgsql;

-- ─── update_list_favorites_count ─────────────────────────────────────────────
-- Maintain favorites_count on list_favorites changes
CREATE OR REPLACE FUNCTION update_list_favorites_count()
RETURNS TRIGGER AS $$
DECLARE
  v_list_id UUID;
  v_count INTEGER;
BEGIN
  v_list_id := COALESCE(NEW.list_id, OLD.list_id);
  
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM list_favorites
  WHERE list_id = v_list_id;
  
  UPDATE lists
  SET favorites_count = v_count
  WHERE id = v_list_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: update favorites count
DROP TRIGGER IF EXISTS trigger_update_list_favorites_count ON list_favorites;
CREATE TRIGGER trigger_update_list_favorites_count
  AFTER INSERT OR DELETE ON list_favorites
  FOR EACH ROW EXECUTE FUNCTION update_list_favorites_count();

-- ─── update_list_saves_count ─────────────────────────────────────────────────
-- Maintain saves_count on list_saves changes
CREATE OR REPLACE FUNCTION update_list_saves_count()
RETURNS TRIGGER AS $$
DECLARE
  v_list_id UUID;
  v_count INTEGER;
BEGIN
  v_list_id := COALESCE(NEW.list_id, OLD.list_id);
  
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM list_saves
  WHERE list_id = v_list_id;
  
  UPDATE lists
  SET saves_count = v_count
  WHERE id = v_list_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: update saves count
DROP TRIGGER IF EXISTS trigger_update_list_saves_count ON list_saves;
CREATE TRIGGER trigger_update_list_saves_count
  AFTER INSERT OR DELETE ON list_saves
  FOR EACH ROW EXECUTE FUNCTION update_list_saves_count();
