-- Rebuild cuisine_type_enum to match TypeScript CuisineType values.
-- Only 3 values differ: arabe→árabe, frutos_do_mar→frutos do mar, fast_food→fast food

-- 1. Free the column in the pivot table
ALTER TABLE place_cuisines ALTER COLUMN cuisine_type TYPE text;

-- 2. Migrate the 3 mismatched values
UPDATE place_cuisines SET cuisine_type = 'árabe'         WHERE cuisine_type = 'arabe';
UPDATE place_cuisines SET cuisine_type = 'frutos do mar' WHERE cuisine_type = 'frutos_do_mar';
UPDATE place_cuisines SET cuisine_type = 'fast food'     WHERE cuisine_type = 'fast_food';

-- 3. Drop old enum
DROP TYPE cuisine_type_enum;

-- 4. Recreate matching TypeScript CUISINE_TYPES
CREATE TYPE cuisine_type_enum AS ENUM (
  'brasileira',
  'japonesa',
  'italiana',
  'árabe',
  'chinesa',
  'mexicana',
  'americana',
  'portuguesa',
  'francesa',
  'indiana',
  'peruana',
  'coreana',
  'tailandesa',
  'mediterrânea',
  'vegana',
  'vegetariana',
  'frutos_do_mar',
  'churrasco',
  'lanches',
  'doces',
  'outros'
);

-- 5. Restore typed column
ALTER TABLE place_cuisines
  ALTER COLUMN cuisine_type TYPE cuisine_type_enum
  USING cuisine_type::cuisine_type_enum;
