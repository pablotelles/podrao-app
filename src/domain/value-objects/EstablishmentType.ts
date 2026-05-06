// Values match the establishment_type_enum in the database (lowercase, snake_case)
export const ESTABLISHMENT_TYPES = [
  'restaurante',
  'bar',
  'cafeteria',
  'padaria',
  'lanchonete',
  'food_truck',
] as const;

export type EstablishmentType = (typeof ESTABLISHMENT_TYPES)[number];

// Display metadata with user-friendly labels
export const ESTABLISHMENT_TYPE_META: Record<EstablishmentType, { icon: string; label: string }> = {
  restaurante: { icon: '🍽️', label: 'Restaurante' },
  bar: { icon: '🍺', label: 'Bar' },
  cafeteria: { icon: '☕', label: 'Cafeteria' },
  padaria: { icon: '🥖', label: 'Padaria' },
  lanchonete: { icon: '🥪', label: 'Lanchonete' },
  food_truck: { icon: '🚚', label: 'Food Truck' },
};
