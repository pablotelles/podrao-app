-- Phase 2 (simplified — no existing data to preserve):
-- Drops deprecated columns from places, converts establishment_type and
-- price_bucket to ENUMs, updates the stats trigger to write only to place_stats,
-- and adds the init_place_stats trigger for new places.

-- ─── drop deprecated columns ─────────────────────────────────────────────────
-- cuisine_types and meal_types are replaced by place_cuisines / place_meals pivot tables.
-- rating, reviews_count, median_price are replaced by place_stats.
-- photo_url was deprecated in 20260503000005 (superseded by place_photos).

ALTER TABLE places
  DROP COLUMN IF EXISTS cuisine_types,
  DROP COLUMN IF EXISTS meal_types,
  DROP COLUMN IF EXISTS rating,
  DROP COLUMN IF EXISTS reviews_count,
  DROP COLUMN IF EXISTS median_price,
  DROP COLUMN IF EXISTS photo_url;

-- ─── convert TEXT columns to ENUMs ────────────────────────────────────────────
-- Safe for a new project with no production data.

ALTER TABLE places
  ALTER COLUMN establishment_type TYPE establishment_type_enum
    USING establishment_type::establishment_type_enum;

ALTER TABLE places
  ALTER COLUMN price_bucket TYPE price_bucket_enum
    USING price_bucket::price_bucket_enum;

-- ─── update stats trigger ─────────────────────────────────────────────────────
-- Writes only to place_stats. The old UPDATE places ... write is gone.

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
    COALESCE(ROUND(AVG(CASE WHEN thumbs_up THEN 1.0 ELSE 0.0 END) * 5, 2), 0),
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE thumbs_up)::INTEGER,
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_place_stats'
  ) THEN
    CREATE TRIGGER trigger_update_place_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_place_stats();
  END IF;
END;
$$;

-- ─── init trigger: place_stats row on place creation ─────────────────────────

CREATE OR REPLACE FUNCTION init_place_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO place_stats (place_id, rating, reviews_count, thumbs_up_count)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_init_place_stats
AFTER INSERT ON places
FOR EACH ROW EXECUTE FUNCTION init_place_stats();
