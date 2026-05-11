// Values match the establishment_type_enum in the database (lowercase, snake_case)
// MVP: 3 types only
export const ESTABLISHMENT_TYPES = ['restaurante', 'bar', 'padaria'] as const;

export type EstablishmentType = (typeof ESTABLISHMENT_TYPES)[number];

// Display metadata with user-friendly labels
export const ESTABLISHMENT_TYPE_META: Record<EstablishmentType, { icon: string; label: string }> = {
  restaurante: { icon: '🍽️', label: 'Restaurante' },
  bar: { icon: '🍺', label: 'Boteco / Bar' },
  padaria: { icon: '🥖', label: 'Padaria' },
};
