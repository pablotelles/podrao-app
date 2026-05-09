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
-- ST_Distance is NOT used in WHERE — only in a correlated exists check.

DROP FUNCTION IF EXISTS search_recent_lists_nearby(
  double precision, double precision, integer, timestamptz, timestamptz, integer
);

CREATE OR REPLACE FUNCTION search_recent_lists_nearby(
  p_lat      double precision,
  p_lng      double precision,
  p_radius_m integer     DEFAULT 15000,
  p_since    timestamptz DEFAULT (NOW() - INTERVAL '30 days'),
  p_cursor   timestamptz DEFAULT NULL,
  p_limit    integer     DEFAULT 10
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
  updated_at      timestamptz,
  next_cursor     timestamptz
) AS $$
DECLARE
  v_point    geography := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
  v_limit    integer   := LEAST(GREATEST(p_limit, 1), 20);
  v_rows     uuid[];
BEGIN
  -- Collect matching list ids first to avoid re-evaluating geo filter
  SELECT array_agg(l.id)
    INTO v_rows
    FROM lists l
   WHERE l.is_public = true
     AND l.updated_at >= p_since
     AND (p_cursor IS NULL OR l.updated_at < p_cursor)
     AND EXISTS (
           SELECT 1
             FROM list_places lp
             JOIN places       p  ON p.id = lp.place_id
            WHERE lp.list_id = l.id
              AND p.status   = 'approved'
              AND ST_DWithin(p.location, v_point, p_radius_m)
         )
   ORDER BY l.updated_at DESC
   LIMIT v_limit;

  IF v_rows IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH ranked AS (
    -- Aggregate per-list stats in a single pass over list_places + places
    SELECT
      l.id,
      l.name                                           AS title,
      l.cover_url,
      l.saves_count,
      l.created_at,
      l.updated_at,
      COUNT(DISTINCT lp.place_id)                      AS places_count,
      -- price range from place_stats (median_price)
      MIN(ps.median_price)::integer                    AS price_range_min,
      MAX(ps.median_price)::integer                    AS price_range_max,
      -- bairro: take the one belonging to the place with lowest position
      (
        SELECT p2.bairro
          FROM list_places lp2
          JOIN places       p2 ON p2.id = lp2.place_id
         WHERE lp2.list_id = l.id
         ORDER BY lp2.position ASC
         LIMIT 1
      )                                                AS bairro
    FROM lists        l
    JOIN list_places  lp ON lp.list_id  = l.id
    JOIN places       p  ON p.id        = lp.place_id AND p.status = 'approved'
    LEFT JOIN place_stats ps ON ps.place_id = p.id
    WHERE l.id = ANY(v_rows)
    GROUP BY l.id, l.name, l.cover_url, l.saves_count, l.created_at, l.updated_at
    ORDER BY l.updated_at DESC
  )
  SELECT
    r.id,
    r.title,
    r.cover_url,
    r.bairro,
    r.places_count,
    r.saves_count,
    r.price_range_min,
    r.price_range_max,
    r.created_at,
    r.updated_at,
    -- next_cursor: updated_at of last row in the result set, or NULL if fewer rows than limit
    CASE
      WHEN COUNT(*) OVER () >= v_limit
      THEN LAST_VALUE(r.updated_at) OVER (ORDER BY r.updated_at DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
      ELSE NULL
    END AS next_cursor
  FROM ranked r;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_recent_lists_nearby IS
  'Returns public lists updated since p_since that contain at least one approved place '
  'within p_radius_m metres of (p_lat, p_lng). '
  'Cursor-based pagination via p_cursor (= updated_at of last seen row). '
  'ST_DWithin in WHERE uses GIST index on places.location; ST_Distance never in WHERE. '
  'price_range_min/max derived from place_stats.median_price.';

-- Grant execute to all Supabase roles
GRANT EXECUTE ON FUNCTION search_recent_lists_nearby(
  double precision, double precision, integer, timestamptz, timestamptz, integer
) TO anon, authenticated, service_role;
