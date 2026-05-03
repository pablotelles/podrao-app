-- ============================================================================
-- RLS Policies: place_photos
-- ============================================================================
-- Este arquivo é idempotente — pode ser re-executado para atualizar policies.
-- Rode via: npm run db:policies
-- ============================================================================

-- Ativar RLS (idempotente)
ALTER TABLE place_photos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT (leitura)
-- ============================================================================

-- Qualquer pessoa pode ver fotos de lugares aprovados
DROP POLICY IF EXISTS "place_photos_read_approved" ON place_photos;
CREATE POLICY "place_photos_read_approved"
  ON place_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM places 
      WHERE places.id = place_photos.place_id 
      AND places.status = 'approved'
    )
  );

-- Criador pode ver fotos de seus próprios lugares (mesmo se pending)
DROP POLICY IF EXISTS "place_photos_read_own" ON place_photos;
CREATE POLICY "place_photos_read_own"
  ON place_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM places 
      WHERE places.id = place_photos.place_id 
      AND places.created_by = auth.uid()
    )
  );

-- ============================================================================
-- INSERT (upload)
-- ============================================================================

-- Apenas o criador do lugar pode adicionar fotos
DROP POLICY IF EXISTS "place_photos_insert_own" ON place_photos;
CREATE POLICY "place_photos_insert_own"
  ON place_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM places 
      WHERE places.id = place_photos.place_id 
      AND places.created_by = auth.uid()
    )
  );

-- ============================================================================
-- UPDATE (editar posição/caption - futuro)
-- ============================================================================

-- Apenas o criador do lugar pode atualizar fotos
DROP POLICY IF EXISTS "place_photos_update_own" ON place_photos;
CREATE POLICY "place_photos_update_own"
  ON place_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM places 
      WHERE places.id = place_photos.place_id 
      AND places.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM places 
      WHERE places.id = place_photos.place_id 
      AND places.created_by = auth.uid()
    )
  );

-- ============================================================================
-- DELETE (deleção)
-- ============================================================================

-- Apenas o criador do lugar pode deletar fotos
DROP POLICY IF EXISTS "place_photos_delete_own" ON place_photos;
CREATE POLICY "place_photos_delete_own"
  ON place_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM places 
      WHERE places.id = place_photos.place_id 
      AND places.created_by = auth.uid()
    )
  );
