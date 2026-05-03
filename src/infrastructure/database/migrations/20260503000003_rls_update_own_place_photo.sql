-- Permitir que o criador do lugar possa atualizar a foto (photo_url)
CREATE POLICY "places_update_own_photo"
  ON places
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);
