-- Rebuild meal_type_enum with new values.
-- Old enum: cafe, almoco, lanche, jantar, rodizio (ASCII, no accents)
-- New enum: café da manhã, almoço, lanche, jantar, sobremesa, drinks, madrugada

-- 1. Free the column from the enum constraint so we can rename values freely
ALTER TABLE place_meals ALTER COLUMN meal_type TYPE text;

-- 2. Migrate existing rows to new string values
UPDATE place_meals SET meal_type = 'café da manhã' WHERE meal_type = 'cafe';
UPDATE place_meals SET meal_type = 'almoço'        WHERE meal_type = 'almoco';
DELETE FROM place_meals WHERE meal_type = 'rodizio';

-- 3. Drop the old enum
DROP TYPE meal_type_enum;

-- 4. Recreate with the correct values (matches TypeScript MEAL_TYPES)
CREATE TYPE meal_type_enum AS ENUM (
  'café da manhã',
  'almoço',
  'lanche',
  'jantar',
  'sobremesa',
  'drinks',
  'madrugada'
);

-- 5. Restore the typed column
ALTER TABLE place_meals
  ALTER COLUMN meal_type TYPE meal_type_enum
  USING meal_type::meal_type_enum;
