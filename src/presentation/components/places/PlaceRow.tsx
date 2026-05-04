'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MoreHorizontal, Heart } from 'lucide-react';
import type { Place } from '@/domain/entities/Place';
import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import {
  ESTABLISHMENT_TYPE_META,
  type EstablishmentType,
} from '@/domain/value-objects/EstablishmentType';
import { useDistance } from '@/presentation/hooks/useDistance';
import { useFavorites } from '@/presentation/hooks/useFavorites';

interface PlaceRowProps {
  place: Place;
  rank?: number;
  onMenuClick?: (place: Place) => void;
}

export function PlaceRow({ place, rank, onMenuClick }: PlaceRowProps) {
  const { distanceText, hasUserLocation } = useDistance(place.lat, place.lng);
  const { isFavorited, toggle } = useFavorites();

  const favorited = isFavorited(place.id);
  const recommendPct = place.reviewsCount > 0 ? Math.round(place.rating * 20) : null;

  return (
    <div className="flex items-center gap-3 bg-bg rounded-xl border border-border px-4 py-3 shadow-(--shadow-card)">
      {/* Thumbnail com rank opcional */}
      <Link href={`/places/${place.id}`} className="relative shrink-0">
        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-bg-subtle">
          {place.logoUrl ? (
            <Image
              src={place.logoUrl}
              alt={place.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="h-full w-full bg-bg-subtle" />
          )}
        </div>
        {rank !== undefined && (
          <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white leading-none">
            {rank}
          </span>
        )}
      </Link>

      {/* Info */}
      <Link href={`/places/${place.id}`} className="flex-1 min-w-0">
        <p className="font-semibold text-text-primary leading-tight truncate">{place.name}</p>
        <p className="mt-0.5 text-xs text-text-secondary">
          {ESTABLISHMENT_TYPE_META[place.establishmentType as EstablishmentType]?.label ||
            place.establishmentType}
          {place.bairro ? ` · ${place.bairro}` : ''}
        </p>
        <p className="mt-0.5 text-xs text-text-secondary">
          {PRICE_BUCKET_LABELS[place.priceBucket]}
          {place.mealTypes
            .slice(0, 2)
            .map((m) => ` · ${m}`)
            .join('')}
          {hasUserLocation ? ` · ${distanceText}` : ''}
        </p>
        {recommendPct !== null && (
          <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
            <span>👍</span>
            <span className="font-medium text-success">{recommendPct}%</span>
            <span>recomendam</span>
          </p>
        )}
      </Link>

      {/* Ações */}
      <div className="flex shrink-0 flex-col items-center justify-between self-stretch py-0.5">
        <button
          onClick={() => onMenuClick?.(place)}
          className="text-text-disabled hover:text-text-secondary"
          aria-label="Opções"
        >
          <MoreHorizontal size={18} />
        </button>
        <button
          onClick={() => void toggle(place.id)}
          className={favorited ? 'text-red-500' : 'text-text-disabled hover:text-text-secondary'}
          aria-label={favorited ? 'Remover favorito' : 'Favoritar'}
        >
          <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}
