CREATE TABLE reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id     UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  thumbs_up    BOOLEAN NOT NULL,
  amount_paid  NUMERIC(8, 2),
  meal_type    TEXT,
  comment      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),

  -- garante 1 review por usuário por lugar (409 na API)
  UNIQUE(place_id, user_id)
);
