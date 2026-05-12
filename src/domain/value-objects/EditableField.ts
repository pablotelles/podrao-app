/**
 * Maps each editable field to its level and JSONB encoding format.
 *
 * Level 1 (threshold = 3): simple / low-impact fields
 * Level 2 (threshold = 7): high-impact fields that require more social proof
 *
 * JSONB conventions:
 *   scalar  → { "value": "texto" }
 *   array   → { "values": ["a", "b"] }
 *   location→ { "address": "...", "lat": -23.5, "lng": -46.6 }
 */
export type EditJsonbEncoding = 'scalar' | 'array' | 'location';

export interface EditableFieldMeta {
  level: 1 | 2;
  encoding: EditJsonbEncoding;
}

export const EDITABLE_FIELDS: Record<string, EditableFieldMeta> = {
  // Level 1 — array
  periods: { level: 1, encoding: 'array' },
  payment_methods: { level: 1, encoding: 'array' },
  food_tags: { level: 1, encoding: 'array' },
  drink_tags: { level: 1, encoding: 'array' },
  specialty_tags: { level: 1, encoding: 'array' },
  // Level 1 — scalar
  service_type: { level: 1, encoding: 'scalar' },
  has_happy_hour: { level: 1, encoding: 'scalar' },
  opens_early: { level: 1, encoding: 'scalar' },
  price_bucket: { level: 1, encoding: 'scalar' },
  description: { level: 1, encoding: 'scalar' },
  cover_photo: { level: 1, encoding: 'scalar' },
  // Level 2 — scalar
  name: { level: 2, encoding: 'scalar' },
  establishment_type: { level: 2, encoding: 'scalar' },
  bar_focus: { level: 2, encoding: 'scalar' },
  // Level 2 — location
  location: { level: 2, encoding: 'location' },
};

export type EditableFieldName = keyof typeof EDITABLE_FIELDS;

export function isEditableField(name: string): name is EditableFieldName {
  return Object.prototype.hasOwnProperty.call(EDITABLE_FIELDS, name);
}

export function getFieldMeta(name: string): EditableFieldMeta | null {
  return EDITABLE_FIELDS[name] ?? null;
}
