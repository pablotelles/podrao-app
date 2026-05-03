CREATE TABLE places (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name               TEXT NOT NULL,
  address            TEXT NOT NULL,
  bairro             TEXT,
  cidade             TEXT NOT NULL,
  estado             TEXT NOT NULL,

  -- geography usa coordenadas esféricas (metros reais) — preferível a geometry para distâncias globais
  location           GEOGRAPHY(POINT, 4326) NOT NULL,

  -- redundância intencional: lat/lng numéricos para queries simples sem PostGIS
  lat                NUMERIC(10, 7) NOT NULL,
  lng                NUMERIC(10, 7) NOT NULL,

  establishment_type TEXT NOT NULL,
  cuisine_types      TEXT[] NOT NULL DEFAULT '{}',
  meal_types         TEXT[] NOT NULL DEFAULT '{}',
  price_bucket       TEXT NOT NULL CHECK (price_bucket IN ('up_to_15','15_25','25_40','40_70','70_plus')),
  median_price       NUMERIC(8, 2),

  photo_url          TEXT,
  rating             NUMERIC(3, 2) DEFAULT 0,
  reviews_count      INTEGER DEFAULT 0,
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),

  -- coluna para busca semântica (pós-MVP) — NULL durante MVP
  embedding          vector(1536),

  created_by         UUID REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);
