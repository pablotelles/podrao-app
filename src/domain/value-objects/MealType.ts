// Values match the meal_type_enum in the database (lowercase, no accents)
export const MEAL_TYPES = ['cafe', 'almoco', 'lanche', 'jantar', 'rodizio'] as const;

export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_TYPE_META: Record<MealType, { label: string; emoji: string }> = {
  cafe: { label: 'Café da manhã', emoji: '☕' },
  almoco: { label: 'Almoço', emoji: '🍽️' },
  lanche: { label: 'Lanche', emoji: '🥪' },
  jantar: { label: 'Jantar', emoji: '🌙' },
  rodizio: { label: 'Rodízio', emoji: '🍖' },
};
