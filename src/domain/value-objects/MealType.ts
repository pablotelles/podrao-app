export const MEAL_TYPES = ['café', 'almoço', 'lanche', 'jantar', 'rodízio'] as const;

export type MealType = (typeof MEAL_TYPES)[number];
