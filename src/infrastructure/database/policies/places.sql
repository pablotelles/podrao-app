-- ============================================================================
-- RLS Policies: places
-- ============================================================================
-- Este arquivo é idempotente — pode ser re-executado para atualizar policies.
-- Rode via: npm run db:policies
-- 
-- FILOSOFIA: RLS apenas para proteção básica de autenticação.
-- Lógica de ownership e aprovação é validada nos Use Cases (application layer).
-- ============================================================================

-- Ativar RLS (idempotente — não falha se já ativado)
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT (leitura)
-- ============================================================================

-- Todos podem ler todos os lugares (filtragem de status feita em código)
DROP POLICY IF EXISTS "places_read_approved" ON places;
DROP POLICY IF EXISTS "places_read_own" ON places;
DROP POLICY IF EXISTS "places_read_all" ON places;
CREATE POLICY "places_read_all"
  ON places FOR SELECT
  USING (true);

-- ============================================================================
-- INSERT (criação)
-- ============================================================================

-- Apenas usuários autenticados podem criar lugares
DROP POLICY IF EXISTS "places_insert_auth" ON places;
DROP POLICY IF EXISTS "places_insert_authenticated" ON places;
CREATE POLICY "places_insert_authenticated"
  ON places FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- UPDATE (edição)
-- ============================================================================

-- Apenas usuários autenticados podem atualizar lugares
-- Validação de ownership (só editar próprios) feita no Use Case
DROP POLICY IF EXISTS "places_update_own" ON places;
DROP POLICY IF EXISTS "places_update_authenticated" ON places;
CREATE POLICY "places_update_authenticated"
  ON places FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- DELETE (deleção)
-- ============================================================================

-- Sem política de DELETE — lugares não são deletados, apenas rejeitados via UPDATE
