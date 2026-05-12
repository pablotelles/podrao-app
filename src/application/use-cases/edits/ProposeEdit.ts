import type { PlaceEdit } from '@/domain/entities/PlaceEdit';
import type { Place } from '@/domain/entities/Place';
import type { IPlaceEditRepository } from '@/domain/interfaces/IPlaceEditRepository';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import { isEditableField, getFieldMeta } from '@/domain/value-objects/EditableField';
import { EDIT_RATE_LIMIT_PER_DAY } from '@/domain/value-objects/EditConstants';
import { EditFieldNotEditableError } from '@/application/errors/EditFieldNotEditableError';
import { EditConflictError } from '@/application/errors/EditConflictError';
import { EditRateLimitError } from '@/application/errors/EditRateLimitError';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';

export interface ProposeEditDTO {
  placeId: string;
  fieldName: string;
  newValue: unknown;
  note?: string;
  userId: string;
}

export class ProposeEdit {
  constructor(
    private readonly editRepo: IPlaceEditRepository,
    private readonly placeRepo: Pick<IPlaceRepository, 'findById'>,
  ) {}

  async execute(dto: ProposeEditDTO): Promise<PlaceEdit> {
    // 1. Validate field is editable
    if (!isEditableField(dto.fieldName)) {
      throw new EditFieldNotEditableError(dto.fieldName);
    }

    const meta = getFieldMeta(dto.fieldName)!;

    // 2. Validate place exists
    const place = await this.placeRepo.findById(dto.placeId);
    if (!place) throw new PlaceNotFoundError(dto.placeId);

    // 3. Check no pending edit for this (place, field) combination
    const existing = await this.editRepo.findPendingByPlaceAndField(dto.placeId, dto.fieldName);
    if (existing) throw new EditConflictError(dto.fieldName);

    // 4. Check rate limit — max N proposals per 24h per user
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await this.editRepo.countByUserSince(dto.userId, since);
    if (count >= EDIT_RATE_LIMIT_PER_DAY) {
      throw new EditRateLimitError(EDIT_RATE_LIMIT_PER_DAY);
    }

    // 5. Snapshot current value from place data
    const oldValue = this.snapshotCurrentValue(place, dto.fieldName);

    // 6. Normalize newValue to JSONB encoding format
    const newValue = this.normalizeValue(dto.newValue, meta.encoding);

    // 7. Create the proposal
    return this.editRepo.create({
      placeId: dto.placeId,
      fieldName: dto.fieldName,
      oldValue,
      newValue,
      level: meta.level,
      userId: dto.userId,
      note: dto.note,
    });
  }

  private snapshotCurrentValue(place: Place, fieldName: string): unknown {
    switch (fieldName) {
      case 'name':
        return { value: place.name };
      case 'description':
        return { value: place.description ?? null };
      case 'price_bucket':
        return { value: place.priceBucket };
      case 'establishment_type':
        return { value: place.establishmentType };
      case 'location':
        return { address: place.address, lat: place.lat, lng: place.lng };
      case 'cover_photo':
        return { value: null }; // cover_photo is read from place_photos; snapshot via null
      case 'periods':
        return { values: place.periods };
      case 'bar_focus':
        return { value: place.attributes['bar_focus']?.[0] ?? null };
      case 'service_type':
        return { value: place.attributes['service_type']?.[0] ?? null };
      case 'has_happy_hour':
        return { value: place.attributes['has_happy_hour']?.[0] ?? null };
      case 'opens_early':
        return { value: place.attributes['opens_early']?.[0] ?? null };
      case 'payment_methods':
        return { values: place.attributes['payment_methods'] ?? [] };
      case 'food_tags':
        return { values: place.attributes['food_tags'] ?? [] };
      case 'drink_tags':
        return { values: place.attributes['drink_tags'] ?? [] };
      case 'specialty_tags':
        return { values: place.attributes['specialty_tags'] ?? [] };
      default: {
        // If a new field is added to EDITABLE_FIELDS without a case here, fail loudly
        const exhausted: never = fieldName as never;
        throw new Error(`snapshotCurrentValue: unhandled field "${exhausted}"`);
      }
    }
  }

  private normalizeValue(raw: unknown, encoding: 'scalar' | 'array' | 'location'): unknown {
    if (encoding === 'location') {
      // Expect raw to be { address, lat, lng }
      const loc = raw as { address?: string; lat?: number; lng?: number };
      return { address: loc.address ?? '', lat: loc.lat ?? 0, lng: loc.lng ?? 0 };
    }
    if (encoding === 'array') {
      const arr = Array.isArray(raw) ? raw : [];
      return { values: arr as string[] };
    }
    // scalar
    return { value: raw };
  }
}
