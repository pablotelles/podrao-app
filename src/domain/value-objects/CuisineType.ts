// Values match the cuisine_type_enum in the database (lowercase, no accents, underscores)
export const CUISINE_TYPES = [
  'brasileira',
  'japonesa',
  'italiana',
  'arabe',
  'chinesa',
  'mexicana',
  'outro',
] as const;

export type CuisineType = (typeof CUISINE_TYPES)[number];

export const CUISINE_TYPE_META: Record<CuisineType, { label: string; emoji: string }> = {
  brasileira: { label: 'Brasileira', emoji: '🇧🇷' },
  japonesa: { label: 'Japonesa', emoji: '🍱' },
  italiana: { label: 'Italiana', emoji: '🍝' },
  arabe: { label: 'Árabe', emoji: '🥙' },
  chinesa: { label: 'Chinesa', emoji: '🥢' },
  mexicana: { label: 'Mexicana', emoji: '🌮' },
  outro: { label: 'Outro', emoji: '🍽️' },
};
