-- Backfill place_stats para lugares criados antes do trigger init_place_stats existir.
-- Idempotente: ON CONFLICT DO NOTHING garante que rows existentes não sejam alteradas.

-- 1. Inicializa com zeros para lugares que não têm place_stats
INSERT INTO place_stats (place_id, rating, reviews_count, thumbs_up_count)
SELECT id, 0, 0, 0
FROM places
WHERE id NOT IN (SELECT place_id FROM place_stats)
ON CONFLICT DO NOTHING;

-- 2. Recalcula os agregados para places que já têm reviews
UPDATE place_stats ps
SET
  rating          = subq.avg_rating,
  reviews_count   = subq.cnt,
  thumbs_up_count = subq.thumbs_up,
  median_price    = subq.median_price,
  updated_at      = NOW()
FROM (
  SELECT
    place_id,
    ROUND(AVG(rating::NUMERIC), 2)                                                      AS avg_rating,
    COUNT(*)::INTEGER                                                                    AS cnt,
    COUNT(*) FILTER (WHERE rating >= 4)::INTEGER                                        AS thumbs_up,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_paid)
      FILTER (WHERE amount_paid IS NOT NULL)                                             AS median_price
  FROM reviews
  GROUP BY place_id
) subq
WHERE ps.place_id = subq.place_id;
