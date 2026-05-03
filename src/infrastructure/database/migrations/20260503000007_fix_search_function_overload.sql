-- Fix: remover TODAS as versões antigas de search_nearby_places antes de recriar
-- O problema ocorreu porque migrations anteriores criaram versões com tipos diferentes
-- e o DROP específico não removeu todas as sobrecargas

-- Remover versão antiga com FLOAT (da migration 20260503000001)
DROP FUNCTION IF EXISTS search_nearby_places(
  FLOAT, FLOAT, FLOAT, TEXT, TEXT, NUMERIC, INT, INT
);

-- Remover versão com DOUBLE PRECISION (pode existir se Postgres converteu FLOAT)
DROP FUNCTION IF EXISTS search_nearby_places(
  DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, TEXT, NUMERIC, INT, INT
);

-- Remover versão nova com NUMERIC (da migration 20260503000006)  
DROP FUNCTION IF EXISTS search_nearby_places(
  NUMERIC, NUMERIC, INTEGER, TEXT, TEXT, NUMERIC, INTEGER, INTEGER
);

-- Recriar com tipos corretos (NUMERIC para coordenadas, INTEGER para contadores)
CREATE OR REPLACE FUNCTION search_nearby_places(
  p_lat        NUMERIC,
  p_lng        NUMERIC,
  p_radius_m   INTEGER DEFAULT 3000,
  p_meal_type  TEXT    DEFAULT NULL,
  p_cuisine    TEXT    DEFAULT NULL,
  p_max_price  NUMERIC DEFAULT NULL,
  p_limit      INTEGER DEFAULT 20,
  p_offset     INTEGER DEFAULT 0
)
RETURNS TABLE (
  id                UUID,
  name              TEXT,
  address           TEXT,
  numero            TEXT,
  complemento       TEXT,
  bairro            TEXT,
  cidade            TEXT,
  estado            TEXT,
  lat               NUMERIC,
  lng               NUMERIC,
  establishment_type TEXT,
  cuisine_types     TEXT[],
  meal_types        TEXT[],
  price_bucket      TEXT,
  median_price      NUMERIC,
  logo_url          TEXT,
  rating            NUMERIC,
  reviews_count     INTEGER,
  status            TEXT,
  created_by        UUID,
  created_at        TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ,
  distance_m        NUMERIC
) AS $$
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
    p.establishment_type,
    p.cuisine_types,
    p.meal_types,
    p.price_bucket,
    p.median_price,
    pp.url AS logo_url,
    p.rating,
    p.reviews_count,
    p.status,
    p.created_by,
    p.created_at,
    p.updated_at,
    ST_Distance(p.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)::NUMERIC AS distance_m
  FROM places p
  LEFT JOIN place_photos pp ON pp.place_id = p.id AND pp.type = 'logo'
  WHERE
    ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_m
    )
    AND (p_meal_type IS NULL OR p_meal_type = ANY(p.meal_types))
    AND (p_cuisine IS NULL OR p_cuisine = ANY(p.cuisine_types))
    AND (p_max_price IS NULL OR p.price_bucket <= p_max_price::TEXT)
  ORDER BY distance_m
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Adicionar comentário explicativo
COMMENT ON FUNCTION search_nearby_places IS 'Busca lugares próximos usando PostGIS. ST_DWithin no WHERE para usar índice GIST, ST_Distance no SELECT para ordenação.';
