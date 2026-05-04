-- Adiciona contadores de interação social nas listas
-- Contadores desnormalizados para evitar JOINs caros na exibição
ALTER TABLE lists
  ADD COLUMN IF NOT EXISTS view_count      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS favorites_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saves_count     INTEGER NOT NULL DEFAULT 0;

-- Tabela de favoritos de lista (user ativa o coração na lista)
CREATE TABLE IF NOT EXISTS list_favorites (
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id    UUID        NOT NULL REFERENCES lists(id)      ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, list_id)
);

CREATE INDEX IF NOT EXISTS idx_list_favorites_user ON list_favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_list_favorites_list ON list_favorites (list_id);

-- Tabela de saves de lista (user salva lista na própria coleção)
CREATE TABLE IF NOT EXISTS list_saves (
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id    UUID        NOT NULL REFERENCES lists(id)      ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, list_id)
);

CREATE INDEX IF NOT EXISTS idx_list_saves_user ON list_saves (user_id);
CREATE INDEX IF NOT EXISTS idx_list_saves_list ON list_saves (list_id);
