-- Criar bucket para fotos de lugares
INSERT INTO storage.buckets (id, name, public)
VALUES ('place-photos', 'place-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir que qualquer usuário autenticado faça upload
CREATE POLICY "allow_authenticated_uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'place-photos');

-- Permitir que qualquer pessoa veja as fotos (bucket público)
CREATE POLICY "allow_public_reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'place-photos');

-- Permitir que o dono da foto delete
CREATE POLICY "allow_owner_deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'place-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
