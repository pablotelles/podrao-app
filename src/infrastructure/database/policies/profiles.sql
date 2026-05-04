-- ============================================================================
-- RLS Policies: profiles
-- ============================================================================
-- Este arquivo é idempotente — pode ser re-executado para atualizar policies.
-- Rode via: npm run db:policies
--
-- FILOSOFIA: RLS apenas para proteção básica.
-- Lógica de ownership é validada no Use Case UpdateProfile.
-- ============================================================================

-- Ativar RLS (idempotente — não falha se já ativado)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT (leitura)
-- ============================================================================

DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
CREATE POLICY "profiles_read_all"
  ON profiles FOR SELECT 
  USING (true);

-- ============================================================================
-- INSERT (criação)
-- ============================================================================

DROP POLICY IF EXISTS "profiles_insert_authenticated" ON profiles;
CREATE POLICY "profiles_insert_authenticated"
  ON profiles FOR INSERT 
  WITH CHECK (true);

-- ============================================================================
-- UPDATE (edição)
-- ============================================================================

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_authenticated" ON profiles;
CREATE POLICY "profiles_update_authenticated"
  ON profiles FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Nota: Validação de ownership (user só edita próprio perfil) é feita no Use Case UpdateProfile
-- Policy permite UPDATE de qualquer client autenticado (including service_role)
