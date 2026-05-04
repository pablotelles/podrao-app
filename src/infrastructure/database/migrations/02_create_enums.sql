-- Migration 02: Create PostgreSQL ENUMs for type-safe value constraints

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

-- Values without accents to avoid encoding issues
-- Enum values are in ascending price order for comparison operators
CREATE TYPE price_bucket_enum AS ENUM (
  'up_to_15',
  '15_25',
  '25_40',
  '40_70',
  '70_plus'
);

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

-- Without accents: 'cafe' maps to 'café', 'almoco' to 'almoço' in UI
CREATE TYPE meal_type_enum AS ENUM (
  'cafe',
  'almoco',
  'lanche',
  'jantar',
  'rodizio'
);
