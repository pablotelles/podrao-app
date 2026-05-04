-- ============================================================================
-- RLS Policies: place_photos
-- ============================================================================
-- Este arquivo é idempotente — pode ser re-executado para atualizar policies.
-- Rode via: npm run db:policies
--
-- FILOSOFIA: RLS apenas para proteção básica de autenticação.
-- Lógica de ownership é validada nos Use Cases e API routes.
-- ============================================================================

-- Ativar RLS (idempotente)
ALTER TABLE place_photos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT (leitura)
-- ============================================================================

-- Todos podem ver todas as fotos (filtragem feita em código)
DROP POLICY IF EXISTS "place_photos_read_approved" ON place_photos;
DROP POLICY IF EXISTS "place_photos_read_own" ON place_photos;
DROP POLICY IF EXISTS "place_photos_read_all" ON place_photos;
CREATE POLICY "place_photos_read_all"
  ON place_photos FOR SELECT
  USING (true);

-- ============================================================================
-- INSERT (upload)
-- ============================================================================

-- Permite INSERT de qualquer client (validação de ownership em código)
DROP POLICY IF EXISTS "place_photos_insert_own" ON place_photos;
DROP POLICY IF EXISTS "place_photos_insert_authenticated" ON place_photos;
CREATE POLICY "place_photos_insert_authenticated"
  ON place_photos FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- UPDATE (editar posição/caption - futuro)
-- ============================================================================

-- Permite UPDATE de qualquer client (validação de ownership em código)
DROP POLICY IF EXISTS "place_photos_update_own" ON place_photos;
DROP POLICY IF EXISTS "place_photos_update_authenticated" ON place_photos;
CREATE POLICY "place_photos_update_authenticated"
  ON place_photos FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- DELETE (deleção)
-- ============================================================================

-- Permite DELETE de qualquer client (validação de ownership em código)
DROP POLICY IF EXISTS "place_photos_delete_own" ON place_photos;
DROP POLICY IF EXISTS "place_photos_delete_authenticated" ON place_photos;
CREATE POLICY "place_photos_delete_authenticated"
  ON place_photos FOR DELETE
  USING (true);
