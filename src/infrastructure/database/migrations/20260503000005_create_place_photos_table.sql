-- Criar tabela para fotos dos lugares (suporte a logo, cover, galeria)
CREATE TABLE place_photos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id     UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('logo', 'cover', 'gallery')),
  position     INTEGER DEFAULT 0,
  uploaded_by  UUID REFERENCES auth.users(id),
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar fotos de um lugar específico
CREATE INDEX idx_place_photos_place_id ON place_photos(place_id);

-- Índice para buscar por tipo (ex: pegar apenas cover)
CREATE INDEX idx_place_photos_type ON place_photos(place_id, type);

-- Migrar dados existentes: photo_url → place_photos (type='logo')
INSERT INTO place_photos (place_id, url, type, position, uploaded_by, uploaded_at)
SELECT 
  id,
  photo_url,
  'logo',
  0,
  created_by,
  created_at
FROM places
WHERE photo_url IS NOT NULL;

-- Comentar coluna deprecated (manter por enquanto para rollback seguro)
COMMENT ON COLUMN places.photo_url IS 'DEPRECATED: Use place_photos relation instead. Will be removed in future migration.';
