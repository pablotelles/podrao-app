-- HOTFIX: restores status='approved' filter and scoring formula removed in 20260503000007.
-- Also fixes price filter that incorrectly compared price_bucket (TEXT) against a numeric value.

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
  logo_url           TEXT,
  rating             NUMERIC,
  reviews_count      INTEGER,
  status             TEXT,
  created_by         UUID,
  created_at         TIMESTAMPTZ,
  updated_at         TIMESTAMPTZ,
  distance_m         NUMERIC
) AS $$
DECLARE
  v_point GEOGRAPHY := ST_SetSRID(ST_MakePoint(p_lng::FLOAT8, p_lat::FLOAT8), 4326)::GEOGRAPHY;
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
    ST_Distance(p.location, v_point)::NUMERIC AS distance_m
  FROM places p
  LEFT JOIN LATERAL (
    SELECT url FROM place_photos
    WHERE place_id = p.id AND type = 'logo'
    ORDER BY position LIMIT 1
  ) pp ON true
  WHERE
    p.status = 'approved'
    AND ST_DWithin(p.location, v_point, p_radius_m)
    AND (p_meal_type IS NULL OR p_meal_type = ANY(p.meal_types))
    AND (p_cuisine   IS NULL OR p_cuisine   = ANY(p.cuisine_types))
    AND (p_max_price IS NULL OR COALESCE(p.median_price, 9999) <= p_max_price)
  ORDER BY
    (
      (1.0 - LEAST(ST_Distance(p.location, v_point) / p_radius_m, 1.0)) * 0.4
      + (COALESCE(p.rating, 0) / 5.0) * 0.4
      + (LOG(GREATEST(COALESCE(p.reviews_count, 0)::NUMERIC, 1)) / 5.0) * 0.2
    ) DESC
  LIMIT  p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_nearby_places IS
  'Busca lugares aprovados próximos. ST_DWithin no WHERE usa GIST index; '
  'ST_Distance no SELECT/ORDER não filtra. '
  'Fase 4 (20260505000007) substitui esta versão por uma que lê de place_stats e tabelas pivô.';
