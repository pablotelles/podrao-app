-- Migration 02: Create PostgreSQL ENUMs for type-safe value constraints

DROP TYPE IF EXISTS establishment_type_enum CASCADE;
DROP TYPE IF EXISTS cuisine_type_enum CASCADE;
DROP TYPE IF EXISTS meal_type_enum CASCADE;
DROP TYPE IF EXISTS food_type_enum CASCADE;
DROP TYPE IF EXISTS price_bucket_enum CASCADE;

CREATE TYPE establishment_type_enum AS ENUM (
  'restaurante',
  'bar',
  'cafeteria',
  'padaria',
  'lanchonete',
  'food_truck'
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
  'outro'
);

CREATE TYPE food_type_enum AS ENUM (
  'pizza',
  'hamburguer',
  'sushi',
  'comida_caseira',
  'doces',
  'cafe',
  'sorvete',
  'churrasco',
  'salgados',
  'cerveja',
  'drinks',
  'vinho',
  'porcoes'
);

-- Without accents: 'cafe' maps to 'café', 'almoco' to 'almoço' in UI
CREATE TYPE meal_type_enum AS ENUM (
  'cafe',
  'almoco',
  'lanche',
  'jantar'
);
