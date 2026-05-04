-- Phase 1: create PostgreSQL ENUMs for constrained value sets.
-- Columns are NOT yet converted (that happens in Phase 5 / migration 008).
-- These ENUMs are used now by the new pivot tables (place_cuisines, place_meals).

CREATE TYPE establishment_type_enum AS ENUM (
  'restaurante',
  'lanchonete',
  'cafeteria',
  'bar',
  'padaria',
  'sorveteria',
  'food_truck',
  'mercado',
  'confeitaria',
  'outro'
);

-- Values without accents to avoid driver/ORM encoding issues.
-- Display labels live in the TypeScript layer (PriceBucket.ts).
CREATE TYPE price_bucket_enum AS ENUM (
  'up_to_15',
  '15_25',
  '25_40',
  '40_70',
  '70_plus'
);

-- Declared in ascending price order so enum comparison operators work correctly:
-- 'up_to_15' < '15_25' < '25_40' < '40_70' < '70_plus'

CREATE TYPE cuisine_type_enum AS ENUM (
  'brasileira',
  'japonesa',
  'italiana',
  'arabe',
  'chinesa',
  'mexicana',
  'americana',
  'portuguesa',
  'francesa',
  'indiana',
  'peruana',
  'vegana',
  'vegetariana',
  'frutos_do_mar',
  'churrasco',
  'pizza',
  'sushi',
  'fast_food',
  'padaria',
  'doces',
  'outras'
);

-- Without accents for the same reason as above.
-- 'cafe' maps to 'café', 'almoco' to 'almoço' in the UI.
CREATE TYPE meal_type_enum AS ENUM (
  'cafe',
  'almoco',
  'lanche',
  'jantar',
  'rodizio'
);
