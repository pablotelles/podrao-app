// Values match the cuisine_type_enum in the database (lowercase, no accents, underscores)
export const CUISINE_TYPES = [
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
  'outras',
] as const;

export type CuisineType = (typeof CUISINE_TYPES)[number];

export const CUISINE_TYPE_META: Record<CuisineType, { label: string; emoji: string }> = {
  brasileira: { label: 'Brasileira', emoji: '🇧🇷' },
  japonesa: { label: 'Japonesa', emoji: '🍱' },
  italiana: { label: 'Italiana', emoji: '🍝' },
  arabe: { label: 'Árabe', emoji: '🥙' },
  chinesa: { label: 'Chinesa', emoji: '🥢' },
  mexicana: { label: 'Mexicana', emoji: '🌮' },
  americana: { label: 'Americana', emoji: '🍔' },
  portuguesa: { label: 'Portuguesa', emoji: '🐟' },
  francesa: { label: 'Francesa', emoji: '🥐' },
  indiana: { label: 'Indiana', emoji: '🍛' },
  peruana: { label: 'Peruana', emoji: '🫙' },
  vegana: { label: 'Vegana', emoji: '🌱' },
  vegetariana: { label: 'Vegetariana', emoji: '🥗' },
  frutos_do_mar: { label: 'Frutos do mar', emoji: '🦞' },
  churrasco: { label: 'Churrasco', emoji: '🥩' },
  pizza: { label: 'Pizza', emoji: '🍕' },
  sushi: { label: 'Sushi', emoji: '🍣' },
  fast_food: { label: 'Fast Food', emoji: '🍟' },
  padaria: { label: 'Padaria', emoji: '🥖' },
  doces: { label: 'Doces', emoji: '🍬' },
  outras: { label: 'Outras', emoji: '🍽️' },
};

// Legacy export for backward compatibility (deprecated)
export const CUISINE_TYPE_EMOJIS: Record<CuisineType, string> = Object.fromEntries(
  Object.entries(CUISINE_TYPE_META).map(([key, val]) => [key, val.emoji]),
) as Record<CuisineType, string>;
