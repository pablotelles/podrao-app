-- Tabela de perfis públicos dos usuários
-- Separada de auth.users para não expor dados sensíveis
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname    TEXT UNIQUE NOT NULL,
  name        TEXT,
  headline    TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: qualquer um lê perfis, só o dono edita
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_all"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger: cria perfil automaticamente ao signup do usuário
-- Nickname derivado da parte local do email (antes do @), garantindo unicidade
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_nick TEXT;
  final_nick TEXT;
  counter    INT := 0;
BEGIN
  base_nick  := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  -- Fallback se o resultado for vazio
  IF base_nick = '' THEN base_nick := 'user'; END IF;

  final_nick := base_nick;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE nickname = final_nick) LOOP
    counter    := counter + 1;
    final_nick := base_nick || counter::TEXT;
  END LOOP;

  INSERT INTO profiles (id, nickname) VALUES (NEW.id, final_nick);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
