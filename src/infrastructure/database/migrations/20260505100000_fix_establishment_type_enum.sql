-- Rebuild establishment_type_enum to match TypeScript EstablishmentType values.
-- Old: restaurante, lanchonete, cafeteria, bar, padaria, sorveteria, food_truck, mercado, confeitaria, outro
-- New: Restaurante, Padaria, Cafeteria, Lanchonete, Bar, Food Truck, Self-service, Outro

-- 1. Free the column
ALTER TABLE places ALTER COLUMN establishment_type TYPE text;

-- 2. Migrate existing rows
UPDATE places SET establishment_type = 'Restaurante'  WHERE establishment_type = 'restaurante';
UPDATE places SET establishment_type = 'Lanchonete'   WHERE establishment_type = 'lanchonete';
UPDATE places SET establishment_type = 'Cafeteria'    WHERE establishment_type = 'cafeteria';
UPDATE places SET establishment_type = 'Bar'          WHERE establishment_type = 'bar';
UPDATE places SET establishment_type = 'Padaria'      WHERE establishment_type = 'padaria';
UPDATE places SET establishment_type = 'Food Truck'   WHERE establishment_type = 'food_truck';
UPDATE places SET establishment_type = 'Outro'        WHERE establishment_type IN ('sorveteria', 'mercado', 'confeitaria', 'outro');

-- 3. Drop old enum
DROP TYPE establishment_type_enum;

-- 4. Recreate matching TypeScript ESTABLISHMENT_TYPES
CREATE TYPE establishment_type_enum AS ENUM (
  'Restaurante',
  'Padaria',
  'Cafeteria',
  'Lanchonete',
  'Bar',
  'Food Truck',
  'Self-service',
  'Outro'
);

-- 5. Restore typed column
ALTER TABLE places
  ALTER COLUMN establishment_type TYPE establishment_type_enum
  USING establishment_type::establishment_type_enum;
