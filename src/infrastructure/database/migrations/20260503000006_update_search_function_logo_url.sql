-- Atualizar função search_nearby_places para incluir logo_url da relação place_photos
DROP FUNCTION IF EXISTS search_nearby_places(
  NUMERIC, NUMERIC, INTEGER, TEXT, TEXT, NUMERIC, INTEGER, INTEGER
);

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
    ST_Distance(
      p.location,
      ST_MakePoint(p_lng, p_lat)::geography
    ) AS distance_m
  FROM places p
  LEFT JOIN place_photos pp ON pp.place_id = p.id AND pp.type = 'logo'
  WHERE
    -- Filtro geográfico (usa GIST index)
    ST_DWithin(p.location, ST_MakePoint(p_lng, p_lat)::geography, p_radius_m)
    -- Apenas lugares aprovados
    AND p.status = 'approved'
    -- Filtro por tipo de refeição (se fornecido)
    AND (p_meal_type IS NULL OR p.meal_types @> ARRAY[p_meal_type])
    -- Filtro por tipo de cozinha (se fornecido)
    AND (p_cuisine IS NULL OR p.cuisine_types @> ARRAY[p_cuisine])
    -- Filtro por preço mediano (se fornecido)
    AND (p_max_price IS NULL OR p.median_price IS NULL OR p.median_price <= p_max_price)
  ORDER BY distance_m
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
