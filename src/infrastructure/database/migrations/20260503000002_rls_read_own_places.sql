-- Permite usuário logado ler seus próprios lugares (mesmo se pending)
CREATE POLICY "places_read_own"
  ON places FOR SELECT
  USING (auth.uid() = created_by);
