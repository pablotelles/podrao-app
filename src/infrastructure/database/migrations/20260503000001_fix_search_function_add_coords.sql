-- Fix: adiciona lat/lng e outros campos faltantes no retorno de search_nearby_places
-- Necessário DROP antes de recriar pois mudamos a assinatura do RETURNS TABLE
DROP FUNCTION IF EXISTS search_nearby_places(FLOAT, FLOAT, FLOAT, TEXT, TEXT, NUMERIC, INT, INT);

CREATE OR REPLACE FUNCTION search_nearby_places(
  p_lat          FLOAT,
  p_lng          FLOAT,
  p_radius_m     FLOAT   DEFAULT 3000,
  p_meal_type    TEXT    DEFAULT NULL,
  p_cuisine      TEXT    DEFAULT NULL,
  p_max_price    NUMERIC DEFAULT NULL,
  p_limit        INT     DEFAULT 20,
  p_offset       INT     DEFAULT 0
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
  price_bucket       TEXT,
  median_price       NUMERIC,
  photo_url          TEXT,
  rating             NUMERIC,
  reviews_count      INT,
  status             TEXT,
  created_by         UUID,
  created_at         TIMESTAMPTZ,
  updated_at         TIMESTAMPTZ,
  distance_m         FLOAT
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
    p.photo_url,
    p.rating,
    p.reviews_count,
    p.status,
    p.created_by,
    p.created_at,
    p.updated_at,
    ST_Distance(
      p.location,
      ST_MakePoint(p_lng, p_lat)::geography
    ) AS distance_m
  FROM places p
  WHERE
    p.status = 'approved'
    AND ST_DWithin(
      p.location,
      ST_MakePoint(p_lng, p_lat)::geography,
      p_radius_m
    )
    AND (p_meal_type IS NULL OR p_meal_type = ANY(p.meal_types))
    AND (p_cuisine    IS NULL OR p_cuisine   = ANY(p.cuisine_types))
    AND (p_max_price  IS NULL OR COALESCE(p.median_price, 9999) <= p_max_price)
  ORDER BY
    (
      (1.0 - LEAST(ST_Distance(p.location, ST_MakePoint(p_lng, p_lat)::geography) / p_radius_m, 1.0)) * 0.4
      + (COALESCE(p.rating, 0) / 5.0) * 0.4
      + (LOG(GREATEST(p.reviews_count, 1)) / 5.0) * 0.2
    ) DESC
  LIMIT  p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
