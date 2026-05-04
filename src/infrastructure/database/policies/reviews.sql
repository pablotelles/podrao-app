-- ============================================================================
-- RLS Policies: reviews
-- ============================================================================
-- Este arquivo é idempotente — pode ser re-executado para atualizar policies.
-- Rode via: npm run db:policies
--
-- FILOSOFIA: RLS apenas para proteção básica de autenticação.
-- Lógica de ownership é validada no Use Case SubmitReview.
-- ============================================================================

-- Ativar RLS (idempotente)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT (leitura)
-- ============================================================================

-- Qualquer pessoa pode ler reviews (público)
DROP POLICY IF EXISTS "reviews_read_all" ON reviews;
CREATE POLICY "reviews_read_all"
  ON reviews FOR SELECT
  USING (true);

-- ============================================================================
-- INSERT (criação)
-- ============================================================================

-- Permite INSERT de qualquer client (validação de ownership em código)
DROP POLICY IF EXISTS "reviews_insert_auth" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON reviews;
CREATE POLICY "reviews_insert_authenticated"
  ON reviews FOR INSERT
  WITH CHECK (true);
