-- Migration 04: Create all database indexes

-- ─── places indexes ──────────────────────────────────────────────────────────
-- GIST index for geo queries (ST_DWithin uses this - crucial for performance)
CREATE INDEX idx_places_location ON places USING GIST (location);

-- Indexes for filtering
CREATE INDEX idx_places_status ON places(status);
CREATE INDEX idx_places_establishment_type ON places(establishment_type);
CREATE INDEX idx_places_price_bucket ON places(price_bucket);
CREATE INDEX idx_places_created_by ON places(created_by);

-- Index for semantic search (post-MVP)
CREATE INDEX idx_places_embedding ON places USING ivfflat (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;

-- ─── place_cuisines indexes ─────────────────────────────────────────────────
CREATE INDEX idx_place_cuisines_cuisine ON place_cuisines(cuisine_type);

-- ─── place_meals indexes ────────────────────────────────────────────────────
CREATE INDEX idx_place_meals_meal ON place_meals(meal_type);

-- ─── place_photos indexes ───────────────────────────────────────────────────
CREATE INDEX idx_place_photos_place_id ON place_photos(place_id);
CREATE INDEX idx_place_photos_type ON place_photos(place_id, type);

-- ─── place_stats indexes ────────────────────────────────────────────────────
CREATE INDEX idx_place_stats_rating ON place_stats(rating DESC);
CREATE INDEX idx_place_stats_reviews ON place_stats(reviews_count DESC);

-- ─── reviews indexes ─────────────────────────────────────────────────────────
CREATE INDEX idx_reviews_place_id ON reviews(place_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating) WHERE rating IS NOT NULL;
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- ─── review_scores indexes ──────────────────────────────────────────────────
CREATE INDEX idx_review_scores_review_id ON review_scores(review_id);
CREATE INDEX idx_review_scores_category ON review_scores(category);

-- ─── review_photos indexes ──────────────────────────────────────────────────
CREATE INDEX idx_review_photos_review_id ON review_photos(review_id);
CREATE INDEX idx_review_photos_created_at ON review_photos(created_at DESC);

-- ─── profiles indexes ────────────────────────────────────────────────────────
CREATE INDEX idx_profiles_nickname ON profiles(nickname);

-- ─── favorites indexes ───────────────────────────────────────────────────────
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_place ON favorites(place_id);

-- ─── lists indexes ───────────────────────────────────────────────────────────
CREATE INDEX idx_lists_owner ON lists(owner_id);
CREATE INDEX idx_lists_public ON lists(is_public) WHERE is_public = true;
CREATE INDEX idx_lists_created_at ON lists(created_at DESC);

-- ─── list_places indexes ────────────────────────────────────────────────────
CREATE INDEX idx_list_places_list ON list_places(list_id);
CREATE INDEX idx_list_places_place ON list_places(place_id);

-- ─── list_favorites indexes ─────────────────────────────────────────────────
CREATE INDEX idx_list_favorites_user ON list_favorites(user_id);
CREATE INDEX idx_list_favorites_list ON list_favorites(list_id);

-- ─── list_saves indexes ─────────────────────────────────────────────────────
CREATE INDEX idx_list_saves_user ON list_saves(user_id);
CREATE INDEX idx_list_saves_list ON list_saves(list_id);

-- ─── reactions indexes ───────────────────────────────────────────────────────
CREATE INDEX idx_reactions_entity ON reactions(entity_type, entity_id, type);
CREATE INDEX idx_reactions_user ON reactions(user_id, entity_type, type);
CREATE INDEX idx_reaction_counts_entity ON reaction_counts(entity_type, entity_id);

-- ─── places moderation indexes ───────────────────────────────────────────────
CREATE INDEX idx_places_pending_created_at ON places(created_at DESC) WHERE status = 'pending';
CREATE INDEX idx_places_rejected_status ON places(status) WHERE status = 'rejected';
