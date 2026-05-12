/**
 * Opções canônicas para campos editáveis com UI estruturada.
 * Os `value`s correspondem ao que é efetivamente armazenado no banco.
 *
 * Campos cujo value é o próprio label de display (payment_methods, food_tags,
 * drink_tags, specialty_tags, service_type, bar_focus) reutilizam as constantes
 * de place-attributes.ts como fonte única de verdade.
 *
 * Campos com encoding distinto (price_bucket, periods) têm seu próprio mapping.
 */

import {
  SERVICE_TYPES,
  FOOD_TAGS,
  PAYMENT_METHODS,
  BAR_FOCUS_OPTIONS,
  DRINK_TAGS,
  SPECIALTY_TAGS,
} from './place-attributes';

export { FOOD_TAGS, DRINK_TAGS, SPECIALTY_TAGS };

export const FOOD_TAG_MAX = 3;
export const DRINK_TAG_MAX = 2;
export const SPECIALTY_TAG_MAX = 2;

export const PRICE_BUCKET_OPTIONS = [
  { value: 'up_to_25', label: 'Até R$25' },
  { value: '25_to_45', label: 'R$25 – 45' },
  { value: '45_to_80', label: 'R$45 – 80' },
  { value: 'above_80', label: 'Acima de R$80' },
] as const;

export const PAYMENT_METHOD_OPTIONS = PAYMENT_METHODS.map((m) => ({ value: m, label: m }));

export const PERIOD_OPTIONS = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
  { value: 'madrugada', label: 'Madrugada' },
] as const;

export const SERVICE_TYPE_OPTIONS = SERVICE_TYPES.map((s) => ({ value: s, label: s }));

export const BAR_FOCUS_OPTIONS_EDITABLE = BAR_FOCUS_OPTIONS.map((b) => ({ value: b, label: b }));
