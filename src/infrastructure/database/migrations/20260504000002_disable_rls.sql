-- ============================================================================
-- Desabilitar RLS em todas as tabelas
-- ============================================================================
-- Filosofia: Toda validação de autenticação e ownership é feita na camada
-- de aplicação (Use Cases e API routes). RLS adiciona complexidade sem
-- benefícios práticos para este projeto.
-- ============================================================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE places DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE place_photos DISABLE ROW LEVEL SECURITY;

-- Remover todas as policies existentes (limpeza)
DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON profiles;
DROP POLICY IF EXISTS "profiles_update_authenticated" ON profiles;

DROP POLICY IF EXISTS "places_read_all" ON places;
DROP POLICY IF EXISTS "places_read_approved" ON places;
DROP POLICY IF EXISTS "places_read_own" ON places;
DROP POLICY IF EXISTS "places_insert_auth" ON places;
DROP POLICY IF EXISTS "places_insert_authenticated" ON places;
DROP POLICY IF EXISTS "places_update_own" ON places;
DROP POLICY IF EXISTS "places_update_authenticated" ON places;

DROP POLICY IF EXISTS "reviews_read_all" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_auth" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON reviews;

DROP POLICY IF EXISTS "place_photos_read_all" ON place_photos;
DROP POLICY IF EXISTS "place_photos_read_approved" ON place_photos;
DROP POLICY IF EXISTS "place_photos_read_own" ON place_photos;
DROP POLICY IF EXISTS "place_photos_insert_authenticated" ON place_photos;
DROP POLICY IF EXISTS "place_photos_update_authenticated" ON place_photos;
DROP POLICY IF EXISTS "place_photos_delete_authenticated" ON place_photos;
