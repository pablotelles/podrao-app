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

-- Apenas usuários autenticados podem adicionar fotos
-- Validação de ownership (só adicionar em próprios lugares) feita em código
DROP POLICY IF EXISTS "place_photos_insert_own" ON place_photos;
DROP POLICY IF EXISTS "place_photos_insert_authenticated" ON place_photos;
CREATE POLICY "place_photos_insert_authenticated"
  ON place_photos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- UPDATE (editar posição/caption - futuro)
-- ============================================================================

-- Apenas usuários autenticados podem atualizar fotos
-- Validação de ownership feita em código
DROP POLICY IF EXISTS "place_photos_update_own" ON place_photos;
DROP POLICY IF EXISTS "place_photos_update_authenticated" ON place_photos;
CREATE POLICY "place_photos_update_authenticated"
  ON place_photos FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- DELETE (deleção)
-- ============================================================================

-- Apenas usuários autenticados podem deletar fotos
-- Validação de ownership feita em código
DROP POLICY IF EXISTS "place_photos_delete_own" ON place_photos;
DROP POLICY IF EXISTS "place_photos_delete_authenticated" ON place_photos;
CREATE POLICY "place_photos_delete_authenticated"
  ON place_photos FOR DELETE
  USING (auth.role() = 'authenticated');
