-- RLS policies para tabela profiles
-- Proteção básica: apenas autenticação, lógica de ownership no código

DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
CREATE POLICY "profiles_read_all"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_authenticated" ON profiles;
CREATE POLICY "profiles_update_authenticated"
  ON profiles FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Nota: Validação de ownership (user só edita próprio perfil) é feita no Use Case UpdateProfile
