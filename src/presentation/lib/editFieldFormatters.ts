import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import { OPERATING_PERIOD_META } from '@/domain/value-objects/OperatingPeriod';

/**
 * The backend (ProposeEdit) stores JSONB values with a wrapper encoding:
 *   scalar → { value: <primitive> }
 *   array  → { values: [<primitives>] }
 *   location → { address, lat, lng }
 *
 * These helpers unwrap those shapes before formatting.
 */

function unwrapScalar(value: unknown): unknown {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    // { value: ... } wrapper from ProposeEdit.normalizeValue
    if ('value' in obj) return obj.value;
  }
  return value;
}

function unwrapArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // { values: [...] } wrapper from ProposeEdit.normalizeValue
    if (Array.isArray(obj.values)) return obj.values;
  }
  return value !== null && value !== undefined ? [value] : [];
}

function toScalar(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map((v) => toScalar(v)).join(', ');
  return String(value);
}

export function formatEditValue(fieldName: string, value: unknown): string {
  if (value === null || value === undefined) return '—';

  switch (fieldName) {
    case 'price_bucket': {
      const raw = toScalar(unwrapScalar(value));
      return PRICE_BUCKET_LABELS[raw as keyof typeof PRICE_BUCKET_LABELS] ?? raw;
    }

    case 'periods':
      return unwrapArray(value)
        .map((v) => {
          const key = toScalar(v);
          const meta = OPERATING_PERIOD_META[key as keyof typeof OPERATING_PERIOD_META];
          return meta ? `${meta.emoji} ${meta.label}` : key;
        })
        .join(', ');

    case 'has_happy_hour':
    case 'opens_early': {
      const raw = unwrapScalar(value);
      return raw === true || raw === 'true' ? 'Sim' : 'Não';
    }

    case 'location': {
      const loc = value as { address?: string; lat?: number; lng?: number };
      return loc?.address ?? `${loc?.lat ?? ''}, ${loc?.lng ?? ''}`;
    }

    case 'payment_methods':
    case 'food_tags':
    case 'drink_tags':
    case 'specialty_tags':
      return unwrapArray(value).map(toScalar).join(', ');

    // Scalar fields: service_type, bar_focus, name, description, cover_photo, etc.
    default:
      return toScalar(unwrapScalar(value));
  }
}
