-- Migration 09: Fix search_recent_lists_nearby
-- Removes next_cursor from RETURNS TABLE (computed in TypeScript instead).
-- Handles NULL lat/lng by skipping geo filter (returns global recents).
-- Eliminates window-function CASE that caused GROUP BY errors on Supabase Postgres.

DROP FUNCTION IF EXISTS search_recent_lists_nearby(
  double precision, double precision, integer, timestamptz, timestamptz, integer
);

CREATE OR REPLACE FUNCTION search_recent_lists_nearby(
  p_lat      double precision DEFAULT NULL,
  p_lng      double precision DEFAULT NULL,
  p_radius_m integer          DEFAULT 15000,
  p_since    timestamptz      DEFAULT (NOW() - INTERVAL '30 days'),
  p_cursor   timestamptz      DEFAULT NULL,
  p_limit    integer          DEFAULT 10
)
RETURNS TABLE (
  id              uuid,
  title           text,
  cover_url       text,
  bairro          text,
  places_count    bigint,
  saves_count     integer,
  price_range_min integer,
  price_range_max integer,
  created_at      timestamptz,
  updated_at      timestamptz
) AS $$
DECLARE
  v_point  geography;
  v_limit  integer := LEAST(GREATEST(p_limit, 1), 20);
  v_rows   uuid[];
BEGIN
  -- Build geo point only when both coordinates are provided
  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    v_point := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
  END IF;

  -- Collect matching list ids ordered by recency
  SELECT array_agg(sub.id)
    INTO v_rows
    FROM (
      SELECT l.id
        FROM lists l
       WHERE l.is_public = true
         AND l.updated_at >= p_since
         AND (p_cursor IS NULL OR l.updated_at < p_cursor)
         AND (
               -- Skip geo filter when coordinates are absent
               v_point IS NULL
               OR EXISTS (
                    SELECT 1
                      FROM list_places lp
                      JOIN places       pl ON pl.id = lp.place_id
                     WHERE lp.list_id = l.id
                       AND pl.status  = 'approved'
                       AND ST_DWithin(pl.location, v_point, p_radius_m)
                  )
             )
       ORDER BY l.updated_at DESC
       LIMIT v_limit
    ) sub;

  IF v_rows IS NULL THEN
    RETURN;
  END IF;

  -- Aggregate stats per list and return ordered results
  RETURN QUERY
    SELECT
      l.id,
      l.name                       AS title,
      l.cover_url,
      (
        SELECT pl2.bairro
          FROM list_places lp2
          JOIN places      pl2 ON pl2.id = lp2.place_id
         WHERE lp2.list_id = l.id
         ORDER BY lp2.position ASC
         LIMIT 1
      )                            AS bairro,
      COUNT(DISTINCT lp.place_id)  AS places_count,
      l.saves_count,
      MIN(ps.median_price)::integer AS price_range_min,
      MAX(ps.median_price)::integer AS price_range_max,
      l.created_at,
      l.updated_at
    FROM lists       l
    JOIN list_places lp ON lp.list_id  = l.id
    JOIN places      pl ON pl.id       = lp.place_id AND pl.status = 'approved'
    LEFT JOIN place_stats ps ON ps.place_id = pl.id
    WHERE l.id = ANY(v_rows)
    GROUP BY l.id, l.name, l.cover_url, l.saves_count, l.created_at, l.updated_at
    ORDER BY l.updated_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_recent_lists_nearby IS
  'Returns public lists updated since p_since. '
  'When p_lat/p_lng provided: filters to lists with at least one approved place within p_radius_m metres. '
  'When p_lat/p_lng are NULL: returns global recents without geo filter. '
  'next_cursor is computed by the caller (TypeScript) from the last row updated_at. '
  'ST_DWithin in WHERE uses GIST index on places.location.';

GRANT EXECUTE ON FUNCTION search_recent_lists_nearby(
  double precision, double precision, integer, timestamptz, timestamptz, integer
) TO anon, authenticated, service_role;
