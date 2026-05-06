-- ============================================================
-- Reações genéricas — funciona para reviews, places, listas
-- ============================================================

CREATE TABLE IF NOT EXISTS reactions (
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT        NOT NULL,
  entity_id   UUID        NOT NULL,
  type        TEXT        NOT NULL DEFAULT 'useful',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, entity_type, entity_id, type)
);

CREATE INDEX IF NOT EXISTS idx_reactions_entity
  ON reactions (entity_type, entity_id, type);

CREATE INDEX IF NOT EXISTS idx_reactions_user
  ON reactions (user_id, entity_type, type);

-- ============================================================
-- Contadores denormalizados — mesmo padrão de place_stats
-- Mantidos por trigger, leitura O(1) sem COUNT(*)
-- ============================================================

CREATE TABLE IF NOT EXISTS reaction_counts (
  entity_type TEXT    NOT NULL,
  entity_id   UUID    NOT NULL,
  type        TEXT    NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  PRIMARY KEY (entity_type, entity_id, type)
);

CREATE INDEX IF NOT EXISTS idx_reaction_counts_entity
  ON reaction_counts (entity_type, entity_id);

-- ============================================================
-- Trigger: mantém reaction_counts em sincronia com reactions
-- ============================================================

CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO reaction_counts (entity_type, entity_id, type, count)
    VALUES (NEW.entity_type, NEW.entity_id, NEW.type, 1)
    ON CONFLICT (entity_type, entity_id, type)
    DO UPDATE SET count = reaction_counts.count + 1;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reaction_counts
    SET count = GREATEST(0, count - 1)
    WHERE entity_type = OLD.entity_type
      AND entity_id   = OLD.entity_id
      AND type        = OLD.type;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_reaction_counts
AFTER INSERT OR DELETE ON reactions
FOR EACH ROW EXECUTE FUNCTION update_reaction_counts();
