'use client';

import { StarRating } from '@/presentation/components/ui';
import { PriceBucketGrid } from './PriceBucketGrid';
import { ESTABLISHMENT_TYPE_META } from '@/domain/value-objects/EstablishmentType';
import type { EstablishmentType } from '@/domain/value-objects/EstablishmentType';
import type { Place } from '@/domain/entities/Place';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';

const RATING_LABELS: Record<number, string> = {
  1: 'Péssimo',
  2: 'Ruim',
  3: 'Ok',
  4: 'Muito bom',
  5: 'Excelente!',
};

interface StepMainProps {
  place: Place | undefined;
  rating: number | undefined;
  onRatingChange: (v: number) => void;
  priceBucket: PriceBucket | undefined;
  onPriceBucketChange: (v: PriceBucket | undefined) => void;
}

export function StepMain({
  place,
  rating,
  onRatingChange,
  priceBucket,
  onPriceBucketChange,
}: StepMainProps) {
  const typeMeta =
    place?.establishmentType && place.establishmentType in ESTABLISHMENT_TYPE_META
      ? ESTABLISHMENT_TYPE_META[place.establishmentType as EstablishmentType]
      : null;

  const addressLine = [place?.address, place?.cidade, place?.estado].filter(Boolean).join(', ');

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Lugar context card */}
      {place && (
        <div className="flex items-center gap-3 rounded-md bg-bg-subtle px-4 py-3.5">
          <span className="text-[32px] leading-none" aria-hidden>
            {typeMeta?.icon ?? '📍'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-text-primary">{place.name}</p>
            <p className="truncate text-[13px] text-text-secondary">{addressLine}</p>
          </div>
        </div>
      )}

      {/* Star rating section */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-[15px] font-semibold text-text-primary">Qual a sua nota geral?</p>
        <StarRating value={rating ?? 0} onChange={onRatingChange} size="lg" />
        <p
          className={[
            'text-[14px] font-medium transition-colors',
            rating ? 'text-brand' : 'text-text-disabled',
          ].join(' ')}
        >
          {rating ? RATING_LABELS[rating] : 'Toque nas estrelas para avaliar'}
        </p>
      </div>

      {/* Price bucket section */}
      <div className="flex flex-col gap-3">
        <p className="text-[14px] font-semibold text-text-primary">
          Quanto você gastou por pessoa?{' '}
          <span className="font-normal text-text-disabled">(opcional)</span>
        </p>
        <PriceBucketGrid value={priceBucket} onChange={onPriceBucketChange} />
      </div>
    </div>
  );
}
