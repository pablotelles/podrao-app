-- Funções SQL para incremento/decremento atômico de contadores das listas
-- Evita race conditions em updates concorrentes de contadores

CREATE OR REPLACE FUNCTION increment_list_view(p_list_id UUID)
RETURNS void LANGUAGE sql AS $$
  UPDATE lists SET view_count = view_count + 1 WHERE id = p_list_id;
$$;

CREATE OR REPLACE FUNCTION increment_list_favorites(p_list_id UUID)
RETURNS void LANGUAGE sql AS $$
  UPDATE lists SET favorites_count = favorites_count + 1 WHERE id = p_list_id;
$$;

CREATE OR REPLACE FUNCTION decrement_list_favorites(p_list_id UUID)
RETURNS void LANGUAGE sql AS $$
  UPDATE lists SET favorites_count = GREATEST(0, favorites_count - 1) WHERE id = p_list_id;
$$;

CREATE OR REPLACE FUNCTION increment_list_saves(p_list_id UUID)
RETURNS void LANGUAGE sql AS $$
  UPDATE lists SET saves_count = saves_count + 1 WHERE id = p_list_id;
$$;

CREATE OR REPLACE FUNCTION decrement_list_saves(p_list_id UUID)
RETURNS void LANGUAGE sql AS $$
  UPDATE lists SET saves_count = GREATEST(0, saves_count - 1) WHERE id = p_list_id;
$$;
