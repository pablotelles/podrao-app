-- Trigger que mantém rating, reviews_count e median_price atualizados automaticamente
CREATE OR REPLACE FUNCTION update_place_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE places
  SET
    rating        = (
      SELECT ROUND(AVG(CASE WHEN thumbs_up THEN 1.0 ELSE 0.0 END) * 5, 2)
      FROM reviews WHERE place_id = NEW.place_id
    ),
    reviews_count = (
      SELECT COUNT(*) FROM reviews WHERE place_id = NEW.place_id
    ),
    median_price  = (
      SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_paid)
      FROM reviews
      WHERE place_id = NEW.place_id AND amount_paid IS NOT NULL
    ),
    updated_at    = NOW()
  WHERE id = NEW.place_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_place_stats
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_place_stats();
