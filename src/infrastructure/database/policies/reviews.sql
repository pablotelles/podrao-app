-- ============================================================================
-- RLS Policies: reviews
-- ============================================================================
-- Este arquivo é idempotente — pode ser re-executado para atualizar policies.
-- Rode via: npm run db:policies
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

-- Apenas usuários autenticados podem criar reviews
-- E devem ser o autor (user_id = seu user_id)
DROP POLICY IF EXISTS "reviews_insert_auth" ON reviews;
CREATE POLICY "reviews_insert_auth"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- UPDATE (edição)
-- ============================================================================

-- Sem política de UPDATE — reviews são imutáveis após criação

-- ============================================================================
-- DELETE (deleção)
-- ============================================================================

-- Sem política de DELETE — reviews não podem ser deletadas
