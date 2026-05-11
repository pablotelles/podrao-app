-- Migration 02: Create PostgreSQL ENUMs for type-safe value constraints

DROP TYPE IF EXISTS establishment_type_enum CASCADE;
DROP TYPE IF EXISTS cuisine_type_enum CASCADE;
DROP TYPE IF EXISTS meal_type_enum CASCADE;
DROP TYPE IF EXISTS food_type_enum CASCADE;
DROP TYPE IF EXISTS price_bucket_enum CASCADE;
DROP TYPE IF EXISTS operating_period_enum CASCADE;

-- MVP: 3 establishment types only
CREATE TYPE establishment_type_enum AS ENUM (
  'restaurante',
  'bar',
  'padaria'
);

-- Values without accents to avoid encoding issues
-- Enum values are in ascending price order for comparison operators
CREATE TYPE price_bucket_enum AS ENUM (
  'up_to_25',
  '25_to_45',
  '45_to_80',
  'above_80'
);

-- Operating periods (replaces meal_type_enum — when the place is open/relevant)
CREATE TYPE operating_period_enum AS ENUM (
  'manha',
  'tarde',
  'noite',
  'madrugada'
);
