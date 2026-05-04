export const ESTABLISHMENT_TYPES = [
  'Restaurante',
  'Padaria',
  'Cafeteria',
  'Lanchonete',
  'Bar',
  'Food Truck',
  'Self-service',
  'Outro',
] as const;

export type EstablishmentType = (typeof ESTABLISHMENT_TYPES)[number];

export const ESTABLISHMENT_TYPE_META: Record<EstablishmentType, { icon: string }> = {
  Restaurante: { icon: '🍽️' },
  Padaria: { icon: '🥖' },
  Cafeteria: { icon: '☕' },
  Lanchonete: { icon: '🥪' },
  Bar: { icon: '🍺' },
  'Food Truck': { icon: '🚚' },
  'Self-service': { icon: '🥘' },
  Outro: { icon: '🏪' },
};
