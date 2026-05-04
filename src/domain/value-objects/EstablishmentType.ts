// Values match the establishment_type_enum in the database (lowercase, snake_case)
export const ESTABLISHMENT_TYPES = [
  'restaurante',
  'padaria',
  'cafeteria',
  'lanchonete',
  'bar',
  'food_truck',
  'sorveteria',
  'mercado',
  'confeitaria',
  'outro',
] as const;

export type EstablishmentType = (typeof ESTABLISHMENT_TYPES)[number];

// Display metadata with user-friendly labels
export const ESTABLISHMENT_TYPE_META: Record<EstablishmentType, { icon: string; label: string }> = {
  restaurante: { icon: '🍽️', label: 'Restaurante' },
  padaria: { icon: '🥖', label: 'Padaria' },
  cafeteria: { icon: '☕', label: 'Cafeteria' },
  lanchonete: { icon: '🥪', label: 'Lanchonete' },
  bar: { icon: '🍺', label: 'Bar' },
  food_truck: { icon: '🚚', label: 'Food Truck' },
  sorveteria: { icon: '🍦', label: 'Sorveteria' },
  mercado: { icon: '🛒', label: 'Mercado' },
  confeitaria: { icon: '🧁', label: 'Confeitaria' },
  outro: { icon: '🏪', label: 'Outro' },
};
