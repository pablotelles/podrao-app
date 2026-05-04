-- Migration 03: Create all database tables

-- ─── places ──────────────────────────────────────────────────────────────────
CREATE TABLE places (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name               TEXT NOT NULL,
  address            TEXT NOT NULL,
  numero             TEXT,
  complemento        TEXT,
  bairro             TEXT,
  cidade             TEXT NOT NULL,
  estado             TEXT NOT NULL,
  
  -- Geography uses spherical coordinates (real meters) - better than geometry for global distances
  location           GEOGRAPHY(POINT, 4326) NOT NULL,
  
  -- Intentional redundancy: numeric lat/lng for simple queries without PostGIS
  lat                NUMERIC(10, 7) NOT NULL,
  lng                NUMERIC(10, 7) NOT NULL,
  
  establishment_type establishment_type_enum NOT NULL,
  price_bucket       price_bucket_enum NOT NULL,
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  
  -- Column for semantic search (post-MVP) - NULL during MVP
  embedding          vector(1536),
  
  created_by         UUID REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── place_cuisines ──────────────────────────────────────────────────────────
-- Normalized pivot table replacing places.cuisine_types TEXT[]
CREATE TABLE place_cuisines (
  place_id     UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  cuisine_type cuisine_type_enum NOT NULL,
  PRIMARY KEY (place_id, cuisine_type)
);

-- ─── place_meals ─────────────────────────────────────────────────────────────
-- Normalized pivot table replacing places.meal_types TEXT[]
CREATE TABLE place_meals (
  place_id  UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  meal_type meal_type_enum NOT NULL,
  PRIMARY KEY (place_id, meal_type)
);

-- ─── place_photos ────────────────────────────────────────────────────────────
-- Supports logo, cover image, and gallery photos
CREATE TABLE place_photos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id     UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('logo', 'cover', 'gallery')),
  position     INTEGER DEFAULT 0,
  uploaded_by  UUID REFERENCES auth.users(id),
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── place_stats ─────────────────────────────────────────────────────────────
-- Separates derived aggregates from core places table (eliminates lock contention)
CREATE TABLE place_stats (
  place_id        UUID PRIMARY KEY REFERENCES places(id) ON DELETE CASCADE,
  rating          NUMERIC(3, 2) NOT NULL DEFAULT 0,
  reviews_count   INTEGER NOT NULL DEFAULT 0,
  thumbs_up_count INTEGER NOT NULL DEFAULT 0,
  median_price    NUMERIC(8, 2),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── reviews ─────────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id     UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  amount_paid  NUMERIC(8, 2) CHECK (amount_paid IS NULL OR (amount_paid > 0 AND amount_paid < 2000)),
  meal_type    meal_type_enum,
  comment      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  
  -- Enforce one review per user per place
  UNIQUE(place_id, user_id)
);

-- ─── review_scores ───────────────────────────────────────────────────────────
-- Detailed category ratings (food, service, ambience, value, cleanliness)
CREATE TABLE review_scores (
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  category  TEXT NOT NULL CHECK (category IN ('food', 'service', 'ambience', 'value', 'cleanliness')),
  score     SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  PRIMARY KEY (review_id, category)
);

-- ─── review_photos ───────────────────────────────────────────────────────────
-- User-submitted review images
CREATE TABLE review_photos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id  UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── profiles ────────────────────────────────────────────────────────────────
-- Public user profiles (separate from auth.users to avoid exposing sensitive data)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id     UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname    TEXT UNIQUE NOT NULL,
  name        TEXT,
  email       TEXT,
  headline    TEXT,
  avatar_url  TEXT,
  points      INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── favorites ───────────────────────────────────────────────────────────────
CREATE TABLE favorites (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id   UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, place_id)
);

-- ─── lists ───────────────────────────────────────────────────────────────────
CREATE TABLE lists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL CHECK (length(trim(name)) >= 1),
  description     TEXT,
  is_public       BOOLEAN NOT NULL DEFAULT true,
  view_count      INTEGER NOT NULL DEFAULT 0,
  favorites_count INTEGER NOT NULL DEFAULT 0,
  saves_count     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── list_places ─────────────────────────────────────────────────────────────
CREATE TABLE list_places (
  list_id  UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL DEFAULT 0,
  note     TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (list_id, place_id)
);

-- ─── list_favorites ──────────────────────────────────────────────────────────
-- Users can favorite lists (heart icon)
CREATE TABLE list_favorites (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id    UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, list_id)
);

-- ─── list_saves ──────────────────────────────────────────────────────────────
-- Users can save lists to their own collection
CREATE TABLE list_saves (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id    UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, list_id)
);
