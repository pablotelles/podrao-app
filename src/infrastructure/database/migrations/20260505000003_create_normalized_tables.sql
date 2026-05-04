-- Phase 1: create normalized relational tables.
-- Nothing is removed from the existing schema here — all old columns remain.
-- These tables are populated by dual write (Phase 2 / migration 005) and
-- backfill (Phase 3 / migration 006). Reads switch in Phase 4 (migration 007).

-- ─── place_cuisines ──────────────────────────────────────────────────────────
-- Replaces places.cuisine_types TEXT[].
-- Pivot table with referential integrity enforced by the cuisine_type_enum.

CREATE TABLE place_cuisines (
  place_id     UUID             NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  cuisine_type cuisine_type_enum NOT NULL,
  PRIMARY KEY (place_id, cuisine_type)
);

CREATE INDEX idx_place_cuisines_cuisine ON place_cuisines(cuisine_type);

-- ─── place_meals ─────────────────────────────────────────────────────────────
-- Replaces places.meal_types TEXT[].

CREATE TABLE place_meals (
  place_id  UUID          NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  meal_type meal_type_enum NOT NULL,
  PRIMARY KEY (place_id, meal_type)
);

CREATE INDEX idx_place_meals_meal ON place_meals(meal_type);

-- ─── place_stats ─────────────────────────────────────────────────────────────
-- Separates derived aggregates from the core places table.
-- Eliminates lock contention: reviews trigger writes here, not to places.
-- thumbs_up_count added vs. the old model for recommendation_rate calculation.

CREATE TABLE place_stats (
  place_id        UUID           PRIMARY KEY REFERENCES places(id) ON DELETE CASCADE,
  rating          NUMERIC(3, 2)  NOT NULL DEFAULT 0,
  reviews_count   INTEGER        NOT NULL DEFAULT 0,
  thumbs_up_count INTEGER        NOT NULL DEFAULT 0,
  median_price    NUMERIC(8, 2),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_place_stats_rating       ON place_stats(rating DESC);
CREATE INDEX idx_place_stats_reviews      ON place_stats(reviews_count DESC);

-- ─── favorites ───────────────────────────────────────────────────────────────

CREATE TABLE favorites (
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id   UUID        NOT NULL REFERENCES places(id)     ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, place_id)
);

CREATE INDEX idx_favorites_user  ON favorites(user_id);
CREATE INDEX idx_favorites_place ON favorites(place_id);

-- ─── lists ───────────────────────────────────────────────────────────────────

CREATE TABLE lists (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL CHECK (length(trim(name)) >= 1),
  description TEXT,
  is_public   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lists_owner     ON lists(owner_id);
CREATE INDEX idx_lists_public    ON lists(is_public) WHERE is_public = true;

-- ─── list_places ─────────────────────────────────────────────────────────────

CREATE TABLE list_places (
  list_id  UUID        NOT NULL REFERENCES lists(id)  ON DELETE CASCADE,
  place_id UUID        NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  position SMALLINT    NOT NULL DEFAULT 0,
  note     TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (list_id, place_id)
);

CREATE INDEX idx_list_places_list  ON list_places(list_id);
CREATE INDEX idx_list_places_place ON list_places(place_id);

-- ─── missing index on reviews.user_id ────────────────────────────────────────
-- IReviewRepository.findByUser() was doing a full scan without this.

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
