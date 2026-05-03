-- ============================================================================
-- RLS Policies: places
-- ============================================================================
-- Este arquivo é idempotente — pode ser re-executado para atualizar policies.
-- Rode via: npm run db:policies
-- ============================================================================

-- Ativar RLS (idempotente — não falha se já ativado)
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT (leitura)
-- ============================================================================

-- Qualquer pessoa pode ver lugares aprovados
DROP POLICY IF EXISTS "places_read_approved" ON places;
CREATE POLICY "places_read_approved"
  ON places FOR SELECT
  USING (status = 'approved');

-- Criador pode ver seus próprios lugares (mesmo se pending/rejected)
DROP POLICY IF EXISTS "places_read_own" ON places;
CREATE POLICY "places_read_own"
  ON places FOR SELECT
  USING (auth.uid() = created_by);

-- ============================================================================
-- INSERT (criação)
-- ============================================================================

-- Apenas usuários autenticados podem criar lugares
-- E devem ser o criador (created_by = seu user_id)
DROP POLICY IF EXISTS "places_insert_auth" ON places;
CREATE POLICY "places_insert_auth"
  ON places FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- ============================================================================
-- UPDATE (edição)
-- ============================================================================

-- Criador pode editar seu próprio lugar
DROP POLICY IF EXISTS "places_update_own" ON places;
CREATE POLICY "places_update_own"
  ON places FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Nota: places_update_own_photo foi removida (redundante com places_update_own)

-- ============================================================================
-- DELETE (deleção)
-- ============================================================================

-- Sem política de DELETE — lugares não são deletados, apenas rejeitados via UPDATE
