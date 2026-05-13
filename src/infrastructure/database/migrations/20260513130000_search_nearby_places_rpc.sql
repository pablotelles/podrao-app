-- Migration 09: search_nearby_places RPC
-- Geo search using GIST index (ST_DWithin in WHERE) with optional filters and scoring.
-- ST_Distance is used only in SELECT — never in WHERE — to avoid sequential scans.
-- Scoring mirrors calcPlaceScore in src/infrastructure/database/supabase/scoring.ts:
--   bayesianRating * 2 + log1p(reviewsCount) * 0.5 + 1/(1 + distanceM/1000)
-- Aggregation post-processing (label enrichment, pagination metadata) stays in TypeScript.

-- price_bucket_enum order (ascending): up_to_25, 25_to_45, 45_to_80, above_80
-- p_max_price filters rows where price_bucket <= p_max_price using ENUM ordering.

DROP FUNCTION IF EXISTS search_nearby_places(
  double precision, double precision, integer,
  text, text, text, text, text,
  integer, integer
);

CREATE OR REPLACE FUNCTION search_nearby_places(
  p_lat             double precision DEFAULT NULL,
  p_lng             double precision DEFAULT NULL,
  p_radius_m        integer          DEFAULT 3000,
  p_period          text             DEFAULT NULL,
  p_establishment   text             DEFAULT NULL,
  p_attribute_key   text             DEFAULT NULL,
  p_attribute_value text             DEFAULT NULL,
  p_max_price       text             DEFAULT NULL,  -- price_bucket_enum value; rows with bucket > this value are excluded
  p_limit           integer          DEFAULT 20,
  p_offset          integer          DEFAULT 0
)
RETURNS TABLE (
  -- core place fields
  id                uuid,
  name              text,
  address           text,
  numero            text,
  complemento       text,
  bairro            text,
  cidade            text,
  estado            text,
  lat               numeric,
  lng               numeric,
  establishment_type text,
  price_bucket      text,
  description       text,
  slug              text,
  status            text,
  created_by        uuid,
  created_at        timestamptz,
  updated_at        timestamptz,
  -- stats
  rating            numeric,
  reviews_count     integer,
  -- geo
  distance_m        double precision,
  -- relations (aggregated)
  periods           text[],
  attributes        jsonb,
  logo_url          text,
  -- computed score (for debug / future use)
  score             double precision
) AS $$
DECLARE
  v_point  geography;
  v_limit  integer := LEAST(GREATEST(p_limit, 1), 100);
  v_offset integer := GREATEST(p_offset, 0);
BEGIN
  -- Require coordinates — this function is only called for geo searches
  IF p_lat IS NULL OR p_lng IS NULL THEN
    RAISE EXCEPTION 'p_lat and p_lng are required';
  END IF;

  v_point := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;

  RETURN QUERY
  WITH filtered AS (
    SELECT
      pl.id,
      pl.name,
      pl.address,
      pl.numero,
      pl.complemento,
      pl.bairro,
      pl.cidade,
      pl.estado,
      pl.lat,
      pl.lng,
      pl.establishment_type::text,
      pl.price_bucket::text,
      pl.description,
      pl.slug,
      pl.status,
      pl.created_by,
      pl.created_at,
      pl.updated_at,
      -- ST_Distance only in SELECT — GIST index used via ST_DWithin in WHERE
      ST_Distance(pl.location, v_point) AS distance_m
    FROM places pl
    WHERE
      pl.status = 'approved'
      -- geo filter — drives GIST index usage
      AND ST_DWithin(pl.location, v_point, p_radius_m)
      -- optional: operating period
      AND (
        p_period IS NULL
        OR EXISTS (
          SELECT 1 FROM place_periods pp
          WHERE pp.place_id = pl.id
            AND pp.period = p_period::operating_period_enum
        )
      )
      -- optional: establishment type
      AND (
        p_establishment IS NULL
        OR pl.establishment_type = p_establishment::establishment_type_enum
      )
      -- optional: attribute filter
      AND (
        p_attribute_key IS NULL
        OR EXISTS (
          SELECT 1 FROM place_attributes pa
          WHERE pa.place_id = pl.id
            AND pa.key = p_attribute_key
            AND (p_attribute_value IS NULL OR pa.value = p_attribute_value)
        )
      )
      -- optional: price ceiling (uses ENUM ordering — safe with CAST)
      AND (
        p_max_price IS NULL
        OR pl.price_bucket <= p_max_price::price_bucket_enum
      )
  ),
  with_stats AS (
    SELECT
      f.*,
      COALESCE(ps.rating, 0)        AS stat_rating,
      COALESCE(ps.reviews_count, 0) AS stat_reviews
    FROM filtered f
    LEFT JOIN place_stats ps ON ps.place_id = f.id
  ),
  scored AS (
    SELECT
      ws.*,
      -- Bayesian rating: (5 * 3.5 + reviews * rating) / (5 + reviews)
      -- Mirror of calcPlaceScore: bayesianRating * 2 + log1p(reviews) * 0.5 + 1/(1 + dist/1000)
      (
        ( (5.0 * 3.5 + ws.stat_reviews * ws.stat_rating) / (5.0 + ws.stat_reviews) ) * 2.0
        + LN(1.0 + ws.stat_reviews) * 0.5
        + 1.0 / (1.0 + ws.distance_m / 1000.0)
      ) AS computed_score
    FROM with_stats ws
  )
  SELECT
    sc.id,
    sc.name,
    sc.address,
    sc.numero,
    sc.complemento,
    sc.bairro,
    sc.cidade,
    sc.estado,
    sc.lat,
    sc.lng,
    sc.establishment_type,
    sc.price_bucket,
    sc.description,
    sc.slug,
    sc.status,
    sc.created_by,
    sc.created_at,
    sc.updated_at,
    sc.stat_rating::numeric           AS rating,
    sc.stat_reviews::integer          AS reviews_count,
    sc.distance_m,
    -- periods: array of operating_period strings
    COALESCE(
      (SELECT array_agg(pp.period::text ORDER BY pp.period::text)
         FROM place_periods pp
        WHERE pp.place_id = sc.id),
      '{}'::text[]
    ) AS periods,
    -- attributes: { key: [value, ...], ... } built as jsonb
    COALESCE(
      (SELECT jsonb_object_agg(pa_grp.key, pa_grp.vals)
         FROM (
           SELECT pa.key,
                  jsonb_agg(pa.value ORDER BY pa.value) AS vals
             FROM place_attributes pa
            WHERE pa.place_id = sc.id
            GROUP BY pa.key
         ) pa_grp),
      '{}'::jsonb
    ) AS attributes,
    -- logo_url: first photo with type='logo', ordered by position
    (SELECT pp2.url
       FROM place_photos pp2
      WHERE pp2.place_id = sc.id
        AND pp2.type = 'logo'
      ORDER BY pp2.position ASC
      LIMIT 1
    ) AS logo_url,
    sc.computed_score AS score
  FROM scored sc
  ORDER BY sc.computed_score DESC
  LIMIT v_limit
  OFFSET v_offset;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_nearby_places IS
  'Geo search for approved places within p_radius_m metres of (p_lat, p_lng). '
  'ST_DWithin in WHERE drives the GIST index on places.location. '
  'ST_Distance is computed in SELECT only. '
  'Optional filters: p_period (operating_period_enum), p_establishment (establishment_type_enum), '
  'p_attribute_key / p_attribute_value (place_attributes), p_max_price (price_bucket_enum ceiling). '
  'Scoring mirrors calcPlaceScore in scoring.ts: bayesian_rating*2 + log1p(reviews)*0.5 + 1/(1+dist_km). '
  'Relations (periods, attributes, logo_url) are aggregated inside the function. '
  'Further post-processing (label enrichment, UI mapping) stays in TypeScript.';

-- Grant execute to all Supabase roles
GRANT EXECUTE ON FUNCTION search_nearby_places(
  double precision, double precision, integer,
  text, text, text, text, text,
  integer, integer
) TO anon, authenticated, service_role;
