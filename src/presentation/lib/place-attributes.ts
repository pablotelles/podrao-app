/**
 * Constantes de atributos por tipo de estabelecimento.
 * Fonte única de verdade — consumida por StepDetails* e ContextualFilters.
 */

export const SERVICE_TYPES = [
  'À la carte',
  'Self-service por quilo',
  'Prato feito',
  'Buffet livre',
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const FOOD_TAGS = [
  'Comida caseira',
  'Churrasco',
  'Pizza',
  'Sushi / japonesa',
  'Nordestina',
  'Árabe',
  'Mexicana',
  'Asiática',
  'Hambúrguer',
  'Vegano',
  'Frutos do mar',
] as const;
export type FoodTag = (typeof FOOD_TAGS)[number];

export const PAYMENT_METHODS = ['VR', 'VA', 'Pix', 'Cartão', 'Dinheiro'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const BAR_FOCUS_OPTIONS = [
  'Comida e bebida igual',
  'Bebida com petisco',
  'Só bebida',
] as const;
export type BarFocus = (typeof BAR_FOCUS_OPTIONS)[number];

export const DRINK_TAGS = [
  'Chopp / cerveja',
  'Drinks / coquetelaria',
  'Vinho',
  'Cachaça / doses',
] as const;
export type DrinkTag = (typeof DRINK_TAGS)[number];

export const SPECIALTY_TAGS = [
  'Pão artesanal',
  'Café especial',
  'Doces / confeitaria',
  'Salgados',
  'Marmita / prato feito',
  'Vegano',
] as const;
export type SpecialtyTag = (typeof SPECIALTY_TAGS)[number];
