export const MEAL_TYPES = [
  'café da manhã',
  'almoço',
  'lanche',
  'jantar',
  'sobremesa',
  'drinks',
  'madrugada',
] as const;

export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_TYPE_META: Record<MealType, { label: string; emoji: string }> = {
  'café da manhã': { label: 'Café da manhã', emoji: '☕' },
  almoço: { label: 'Almoço', emoji: '🍽️' },
  lanche: { label: 'Lanche', emoji: '🥪' },
  jantar: { label: 'Jantar', emoji: '🌙' },
  sobremesa: { label: 'Sobremesa', emoji: '🍰' },
  drinks: { label: 'Drinks', emoji: '🍹' },
  madrugada: { label: 'Madrugada', emoji: '🦉' },
};
