ALTER TABLE places  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Qualquer um lê lugares aprovados
CREATE POLICY "places_read_approved"
  ON places FOR SELECT
  USING (status = 'approved');

-- Usuário logado cadastra lugar (status inicia como 'pending')
CREATE POLICY "places_insert_auth"
  ON places FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Usuário edita apenas o próprio lugar (admin usa service role, bypassa RLS)
CREATE POLICY "places_update_own"
  ON places FOR UPDATE
  USING (auth.uid() = created_by);

-- Usuário logado cria review
CREATE POLICY "reviews_insert_auth"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Reviews visíveis para todos (leitura pública)
CREATE POLICY "reviews_read_all"
  ON reviews FOR SELECT
  USING (true);
