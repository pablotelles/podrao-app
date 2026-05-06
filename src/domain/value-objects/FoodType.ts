// Values match the food_type_enum in the database (lowercase, snake_case)
export const FOOD_TYPES = [
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
  'porcoes',
] as const;

export type FoodType = (typeof FOOD_TYPES)[number];

export const FOOD_TYPE_META: Record<FoodType, { label: string; emoji: string }> = {
  pizza: { label: 'Pizza', emoji: '🍕' },
  hamburguer: { label: 'Hamburguer', emoji: '🍔' },
  sushi: { label: 'Sushi', emoji: '🍣' },
  comida_caseira: { label: 'Comida caseira', emoji: '🍲' },
  doces: { label: 'Doces', emoji: '🍬' },
  cafe: { label: 'Café', emoji: '☕' },
  sorvete: { label: 'Sorvete', emoji: '🍦' },
  churrasco: { label: 'Churrasco', emoji: '🥩' },
  salgados: { label: 'Salgados', emoji: '🥐' },
  cerveja: { label: 'Cerveja', emoji: '🍺' },
  drinks: { label: 'Drinks', emoji: '🍹' },
  vinho: { label: 'Vinho', emoji: '🍷' },
  porcoes: { label: 'Porções', emoji: '🍽️' },
};
