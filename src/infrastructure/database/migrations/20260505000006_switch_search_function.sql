-- Phase 4 (final): replace search_nearby_places to read from place_stats and
-- pivot tables. Return shape is IDENTICAL to the previous version so the
-- TypeScript RPC call needs no changes.
-- No fallback COALESCEs to old columns — those columns were dropped in migration 005.

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
    p.establishment_type::TEXT,
    COALESCE(
      array_agg(DISTINCT pc.cuisine_type::TEXT ORDER BY pc.cuisine_type::TEXT)
        FILTER (WHERE pc.cuisine_type IS NOT NULL),
      ARRAY[]::TEXT[]
    )                                                                 AS cuisine_types,
    COALESCE(
      array_agg(DISTINCT pm.meal_type::TEXT ORDER BY pm.meal_type::TEXT)
        FILTER (WHERE pm.meal_type IS NOT NULL),
      ARRAY[]::TEXT[]
    )                                                                 AS meal_types,
    p.price_bucket::TEXT,
    s.median_price,
    ph.url                                                            AS logo_url,
    COALESCE(s.rating, 0)                                             AS rating,
    COALESCE(s.reviews_count, 0)::INTEGER                             AS reviews_count,
    p.status,
    p.created_by,
    p.created_at,
    p.updated_at,
    ST_Distance(p.location, v_point)::NUMERIC                         AS distance_m
  FROM places p
  LEFT JOIN place_stats    s  ON s.place_id  = p.id
  LEFT JOIN place_cuisines pc ON pc.place_id = p.id
  LEFT JOIN place_meals    pm ON pm.place_id = p.id
  LEFT JOIN LATERAL (
    SELECT url FROM place_photos
    WHERE place_id = p.id AND type = 'logo'
    ORDER BY position LIMIT 1
  ) ph ON true
  WHERE
    p.status = 'approved'
    AND ST_DWithin(p.location, v_point, p_radius_m)
    AND (
      p_meal_type IS NULL
      OR EXISTS (
        SELECT 1 FROM place_meals pm2
        WHERE pm2.place_id = p.id AND pm2.meal_type::TEXT = p_meal_type
      )
    )
    AND (
      p_cuisine IS NULL
      OR EXISTS (
        SELECT 1 FROM place_cuisines pc2
        WHERE pc2.place_id = p.id AND pc2.cuisine_type::TEXT = p_cuisine
      )
    )
    AND (p_max_price IS NULL OR COALESCE(s.median_price, 9999) <= p_max_price)
  GROUP BY p.id, s.rating, s.reviews_count, s.median_price, ph.url
  ORDER BY
    (
      (1.0 - LEAST(ST_Distance(p.location, v_point) / p_radius_m, 1.0)) * 0.4
      + (COALESCE(s.rating, 0) / 5.0) * 0.4
      + (LOG(GREATEST(COALESCE(s.reviews_count, 0)::NUMERIC, 1)) / 5.0) * 0.2
    ) DESC
  LIMIT  p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_nearby_places IS
  'Lê de place_stats, place_cuisines, place_meals. '
  'ST_DWithin no WHERE usa o GIST index; ST_Distance só no SELECT/ORDER.';
