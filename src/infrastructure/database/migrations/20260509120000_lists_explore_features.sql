-- Migration 08: Lists explore features
-- Adds geo-proximity RPC and performance index for public list discovery

-- ─── idx_lists_public_updated ────────────────────────────────────────────────
-- Partial index on public lists ordered by recency — used by search_recent_lists_nearby
CREATE INDEX IF NOT EXISTS idx_lists_public_updated
  ON lists (updated_at DESC)
  WHERE is_public = true;

-- ─── search_recent_lists_nearby ──────────────────────────────────────────────
-- Returns public lists recently updated that contain at least one place within
-- p_radius_m metres of the given coordinates.
-- Uses cursor-based pagination (p_cursor = updated_at of last seen row).
-- ST_DWithin in WHERE ensures the GIST index on places.location is used.
-- Aggregation logic (bairro, places_count, price_range_min/max) is handled in TypeScript.

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
  id         uuid,
  updated_at timestamptz
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

  RETURN QUERY
    SELECT l.id, l.updated_at
      FROM lists l
     WHERE l.id = ANY(v_rows)
     ORDER BY l.updated_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_recent_lists_nearby IS
  'Returns IDs of public lists updated since p_since. '
  'When p_lat/p_lng provided: filters to lists with at least one approved place within p_radius_m metres (ST_DWithin uses GIST index). '
  'When p_lat/p_lng are NULL: returns global recents without geo filter. '
  'Cursor-based pagination via p_cursor (= updated_at of last seen row). '
  'Aggregation (bairro, places_count, price_range) is computed in TypeScript.';

-- Grant execute to all Supabase roles
GRANT EXECUTE ON FUNCTION search_recent_lists_nearby(
  double precision, double precision, integer, timestamptz, timestamptz, integer
) TO anon, authenticated, service_role;
