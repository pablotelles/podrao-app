-- Migration 05: Create database functions and triggers


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

  INSERT INTO profiles (id, nickname, email, name, avatar_url)
  VALUES (
    NEW.id,
    final_nick,
    NEW.email,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), '')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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

-- ─── update_reaction_counts ──────────────────────────────────────────────────
-- Maintain reaction_counts in sync with reactions table
CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO reaction_counts (entity_type, entity_id, type, count)
    VALUES (NEW.entity_type, NEW.entity_id, NEW.type, 1)
    ON CONFLICT (entity_type, entity_id, type)
    DO UPDATE SET count = reaction_counts.count + 1;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reaction_counts
    SET count = GREATEST(0, count - 1)
    WHERE entity_type = OLD.entity_type
      AND entity_id   = OLD.entity_id
      AND type        = OLD.type;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_reaction_counts ON reactions;
CREATE TRIGGER trg_update_reaction_counts
  AFTER INSERT OR DELETE ON reactions
  FOR EACH ROW EXECUTE FUNCTION update_reaction_counts();

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

DROP TRIGGER IF EXISTS trigger_update_list_saves_count ON list_saves;
CREATE TRIGGER trigger_update_list_saves_count
  AFTER INSERT OR DELETE ON list_saves
  FOR EACH ROW EXECUTE FUNCTION update_list_saves_count();

-- ─── increment_list_view_count ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_list_view_count(list_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE lists SET view_count = view_count + 1 WHERE id = list_uuid;
END;
$$ LANGUAGE plpgsql;