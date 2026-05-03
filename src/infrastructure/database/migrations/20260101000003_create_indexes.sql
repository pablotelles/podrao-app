-- Índice espacial GIST — base de toda busca geográfica (ST_DWithin usa este índice)
CREATE INDEX idx_places_location ON places USING GIST(location);

-- Filtro de status (apenas aprovados aparecem nas buscas públicas)
CREATE INDEX idx_places_status ON places(status);

-- Filtro composto mais frequente: status + price_bucket
CREATE INDEX idx_places_filters ON places(status, price_bucket);

-- GIN para busca em arrays de cozinha e tipo de refeição
CREATE INDEX idx_places_cuisine_types ON places USING GIN(cuisine_types);
CREATE INDEX idx_places_meal_types    ON places USING GIN(meal_types);

-- Reviews por lugar (join mais comum)
CREATE INDEX idx_reviews_place_id ON reviews(place_id);

-- HNSW para busca semântica com pgvector (pós-MVP)
-- HNSW tem melhor recall que IVFFlat para queries em tempo real
CREATE INDEX idx_places_embedding
  ON places
  USING hnsw (embedding vector_cosine_ops);

-- View de métricas diárias para dashboard de monitoramento
CREATE VIEW daily_metrics AS
SELECT
  DATE(created_at)                                    AS day,
  COUNT(*)                                            AS new_places,
  COUNT(*) FILTER (WHERE status = 'approved')         AS approved_places
FROM places
GROUP BY DATE(created_at)
ORDER BY day DESC;
