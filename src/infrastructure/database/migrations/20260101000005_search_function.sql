-- Busca geográfica principal via Supabase RPC
-- Regra PostGIS: ST_DWithin no WHERE (usa índice GIST), ST_Distance só no SELECT/ORDER BY
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
  bairro             TEXT,
  establishment_type TEXT,
  cuisine_types      TEXT[],
  meal_types         TEXT[],
  price_bucket       TEXT,
  median_price       NUMERIC,
  photo_url          TEXT,
  rating             NUMERIC,
  reviews_count      INT,
  distance_m         FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.address,
    p.bairro,
    p.establishment_type,
    p.cuisine_types,
    p.meal_types,
    p.price_bucket,
    p.median_price,
    p.photo_url,
    p.rating,
    p.reviews_count,
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

-- Busca semântica combinada geo + pgvector (pós-MVP)
CREATE OR REPLACE FUNCTION search_places_semantic(
  p_lat          FLOAT,
  p_lng          FLOAT,
  p_radius_m     FLOAT,
  p_query_embed  vector(1536),
  p_limit        INT DEFAULT 20
)
RETURNS TABLE (
  id           UUID,
  name         TEXT,
  distance_m   FLOAT,
  similarity   FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    ST_Distance(p.location, ST_MakePoint(p_lng, p_lat)::geography) AS distance_m,
    1 - (p.embedding <=> p_query_embed)                            AS similarity
  FROM places p
  WHERE
    p.status = 'approved'
    AND ST_DWithin(p.location, ST_MakePoint(p_lng, p_lat)::geography, p_radius_m)
    AND p.embedding IS NOT NULL
  ORDER BY
    ((1 - (p.embedding <=> p_query_embed)) * 0.6)
    + ((1.0 - LEAST(ST_Distance(p.location, ST_MakePoint(p_lng, p_lat)::geography) / p_radius_m, 1.0)) * 0.4)
    DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
