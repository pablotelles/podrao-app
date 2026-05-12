'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, MapPin, MoreHorizontal } from 'lucide-react';
import type { Place } from '@/domain/entities/Place';
import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import { useDistance } from '@/presentation/hooks/useDistance';
import { Text } from '@/presentation/components/ui/Text';

interface PlaceCardProps {
  place: Place;
  variant?: 'brief' | 'expanded';
  rank?: number;
  badge?: ReactNode;
  onMenuClick?: (place: Place) => void;
  /** true = card individual com shadow; false (padrão) = linha com border-b para uso dentro de SectionShell */
  standalone?: boolean;
}

export function PlaceCard({
  place,
  variant = 'brief',
  rank,
  badge,
  onMenuClick,
  standalone = false,
}: PlaceCardProps) {
  const { distanceText, hasUserLocation } = useDistance(place.lat, place.lng);

  const meta = [PRICE_BUCKET_LABELS[place.priceBucket], place.bairro].filter(Boolean).join(' · ');

  const thumbSize = variant === 'expanded' ? 'h-18 w-18' : 'h-14 w-14';
  const pinSize = variant === 'expanded' ? 28 : 24;
  const align = variant === 'expanded' ? 'items-start' : 'items-center';

  const className = standalone
    ? `flex ${align} gap-3 rounded-md bg-bg ${variant === 'expanded' ? 'p-3.5' : 'p-3'} shadow-(--shadow-card)`
    : `flex ${align} gap-3 border-b border-bg-subtle py-3 last:border-b-0`;

  return (
    <Link href={place.slug ? `/p/${place.slug}` : `/places/${place.id}`} className={className}>
      <div className={`relative ${thumbSize} shrink-0 overflow-hidden rounded-md bg-bg-subtle`}>
        {place.logoUrl ? (
          <Image
            src={place.logoUrl}
            alt={place.name}
            fill
            className="object-cover"
            sizes={variant === 'expanded' ? '72px' : '56px'}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPin size={pinSize} className="text-text-disabled" aria-hidden="true" />
          </div>
        )}
        {rank !== undefined && (
          <Text
            as="span"
            variant="caption"
            textColor="inverse"
            className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand leading-none shadow-(--shadow-card)"
          >
            {rank}
          </Text>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Text as="span" variant="body-strong" className="truncate">
          {place.name}
        </Text>

        {variant === 'expanded' && place.description && (
          <Text as="span" variant="label" textColor="secondary" className="line-clamp-2">
            {place.description}
          </Text>
        )}

        <div
          className={
            variant === 'expanded'
              ? 'mt-0.5 flex items-center justify-between gap-2'
              : 'flex items-center'
          }
        >
          <Text as="span" variant="label" textColor="secondary" className="min-w-0 truncate">
            {meta}
            {hasUserLocation && (
              <Text as="span" variant="label" textColor="primary">
                {' '}
                · {distanceText}
              </Text>
            )}
          </Text>
          {variant === 'expanded' && badge && (
            <div className="flex shrink-0 items-center">{badge}</div>
          )}
        </div>
      </div>

      {variant === 'brief' ? (
        badge ? (
          <div className="flex shrink-0 items-center">{badge}</div>
        ) : onMenuClick ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMenuClick(place);
            }}
            className="flex shrink-0 items-center text-text-disabled hover:text-text-secondary"
            aria-label="Opções"
          >
            <MoreHorizontal size={18} />
          </button>
        ) : (
          <ChevronRight size={16} className="shrink-0 text-text-disabled" aria-hidden="true" />
        )
      ) : (
        <ChevronRight size={16} className="mt-0.5 shrink-0 text-text-disabled" aria-hidden="true" />
      )}
    </Link>
  );
}
