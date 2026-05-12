'use client';

import { Store } from 'lucide-react';
import type { Place } from '@/domain/entities/Place';
import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';

interface PlaceCardHomeProps {
  place: Place;
}

function formatDistance(meters?: number): string | null {
  if (meters == null) return null;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function PlaceCardHome({ place }: PlaceCardHomeProps) {
  const dist = formatDistance(place.distanceM);
  const priceLabel = PRICE_BUCKET_LABELS[place.priceBucket];

  return (
    <a
      href={place.slug ? `/p/${place.slug}` : `/places/${place.id}`}
      aria-label={place.name}
      className="block flex-none overflow-hidden rounded-md bg-bg-card shadow-(--shadow-card) scroll-snap-start"
      style={{ width: '160px', scrollSnapAlign: 'start' }}
    >
      {/* Photo area — 96px tall */}
      <div className="relative bg-bg-subtle" style={{ height: '96px' }}>
        {place.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={place.logoUrl} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Store size={28} className="text-text-disabled" strokeWidth={1.4} />
          </div>
        )}
        {dist && (
          <span
            className="absolute right-1.5 top-1.5 rounded-full font-semibold text-text-inverse backdrop-blur-sm"
            style={{
              background: 'var(--color-overlay-scrim)',
              fontSize: 'var(--font-size-caption)',
              padding: '0.125rem 0.375rem',
            }}
          >
            {dist}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-2.5 pb-2.5 pt-2">
        <p
          className="truncate font-semibold text-text-primary"
          style={{ fontSize: 'var(--font-size-label)' }}
        >
          {place.name}
        </p>
        <p
          className="mt-0.5 truncate text-text-secondary"
          style={{ fontSize: 'var(--font-size-caption)' }}
        >
          <span className="text-success font-medium">{priceLabel}</span>
          {place.bairro ? ` · ${place.bairro}` : ''}
        </p>
      </div>
    </a>
  );
}
