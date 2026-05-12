import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import { OPERATING_PERIOD_META } from '@/domain/value-objects/OperatingPeriod';

export function formatEditValue(fieldName: string, value: unknown): string {
  if (value === null || value === undefined) return '—';

  switch (fieldName) {
    case 'price_bucket':
      return PRICE_BUCKET_LABELS[value as keyof typeof PRICE_BUCKET_LABELS] ?? String(value);

    case 'periods':
      if (Array.isArray(value)) {
        return value
          .map((v) => {
            const meta = OPERATING_PERIOD_META[v as keyof typeof OPERATING_PERIOD_META];
            return meta ? `${meta.emoji} ${meta.label}` : String(v);
          })
          .join(', ');
      }
      return String(value);

    case 'has_happy_hour':
    case 'opens_early':
      return value === true || value === 'true' ? 'Sim' : 'Não';

    case 'location': {
      const loc = value as { address?: string; lat?: number; lng?: number };
      return loc?.address ?? `${loc?.lat ?? ''}, ${loc?.lng ?? ''}`;
    }

    case 'payment_methods':
    case 'food_tags':
    case 'drink_tags':
    case 'specialty_tags':
      if (Array.isArray(value)) return value.join(', ');
      return String(value);

    // Fields that store display labels directly (service_type, bar_focus, name, description, cover_photo)
    default:
      return String(value);
  }
}
