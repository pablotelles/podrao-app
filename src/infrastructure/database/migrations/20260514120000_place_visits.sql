-- Migration 11: Place visits (check-in manual "Estive aqui")
-- KAN-58 — Check-in manual — Estive aqui

-- ─── ENUM ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE visit_recency_enum AS ENUM (
    'today',
    'this_week',
    'a_while_ago'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── place_visits ────────────────────────────────────────────────────────────
-- One row per user check-in at a place.
-- Multiple check-ins per (place, user) are allowed — each represents a distinct visit.

CREATE TABLE IF NOT EXISTS place_visits (
  id          UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id    UUID               NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id     UUID               NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recency     visit_recency_enum NOT NULL,
  visited_at  TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- Used for distinct visitor count and "has user visited?" queries
CREATE INDEX IF NOT EXISTS idx_place_visits_place_user
  ON place_visits (place_id, user_id);

-- Used for user visit history (future: "Meu histórico")
CREATE INDEX IF NOT EXISTS idx_place_visits_user_visited
  ON place_visits (user_id, visited_at DESC);

-- ─── reviews: add visit_id + drop one-review-per-user constraint ─────────────

-- Drop the unique constraint that enforced one review per user per place.
-- The review limit is now dynamic: a user may post 1 + (number of visits) reviews
-- for a given place. Enforcement is handled in TypeScript (SubmitReview use case).
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_place_id_user_id_key;

-- Optional link from a review to the check-in that unlocked it.
-- ON DELETE SET NULL: deleting a visit does not cascade-delete the review.
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS visit_id UUID REFERENCES place_visits(id) ON DELETE SET NULL;

-- Sparse index — most reviews will not have a visit_id during MVP rollout
CREATE INDEX IF NOT EXISTS idx_reviews_visit_id
  ON reviews (visit_id)
  WHERE visit_id IS NOT NULL;

-- ─── Permissions ─────────────────────────────────────────────────────────────

GRANT ALL ON TABLE place_visits TO anon, authenticated, service_role;
