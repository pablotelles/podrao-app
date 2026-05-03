-- ============================================================================
-- RLS Policies: storage (bucket place-photos)
-- ============================================================================
-- Este arquivo é idempotente — pode ser re-executado para atualizar policies.
-- Rode via: npm run db:policies
-- ============================================================================
-- IMPORTANTE: O bucket deve existir antes de aplicar estas policies.
-- Se o bucket não existir, rode: npm run db:migrate
-- ============================================================================

-- ============================================================================
-- SELECT (leitura)
-- ============================================================================

-- Qualquer pessoa pode ver fotos (bucket público)
DROP POLICY IF EXISTS "allow_public_reads" ON storage.objects;
CREATE POLICY "allow_public_reads"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'place-photos');

-- ============================================================================
-- INSERT (upload)
-- ============================================================================

-- Apenas usuários autenticados podem fazer upload
DROP POLICY IF EXISTS "allow_authenticated_uploads" ON storage.objects;
CREATE POLICY "allow_authenticated_uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'place-photos');

-- ============================================================================
-- DELETE (deleção)
-- ============================================================================

-- Apenas o dono da foto pode deletar
-- A pasta segue o padrão: places/{user_id}/{timestamp}.ext
-- Extrai o user_id da pasta e compara com auth.uid()
DROP POLICY IF EXISTS "allow_owner_deletes" ON storage.objects;
CREATE POLICY "allow_owner_deletes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'place-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- UPDATE (renomear/mover)
-- ============================================================================

-- Sem política de UPDATE — arquivos não são movidos ou renomeados
