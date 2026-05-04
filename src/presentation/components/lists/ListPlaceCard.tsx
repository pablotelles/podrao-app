import Link from 'next/link';
import Image from 'next/image';
import type { Place } from '@/domain/entities/Place';
import { Badge } from '@/presentation/components/ui';
import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import { MapPin } from 'lucide-react';

interface ListPlaceCardProps {
  place: Place;
}

export function ListPlaceCard({ place }: ListPlaceCardProps) {
  return (
    <Link href={`/places/${place.id}`} className="flex gap-3 py-3">
      {/* Thumbnail */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bg-subtle">
        {place.logoUrl ? (
          <Image src={place.logoUrl} alt={place.name} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPin className="h-6 w-6 text-text-secondary" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-text-primary leading-tight">{place.name}</p>
        {place.bairro && (
          <p className="mt-0.5 truncate text-xs text-text-secondary">{place.bairro}</p>
        )}
        <div className="mt-1.5 flex flex-wrap gap-1">
          <Badge variant="brand" className="text-xs">
            {PRICE_BUCKET_LABELS[place.priceBucket]}
          </Badge>
          {place.mealTypes.slice(0, 2).map((m) => (
            <Badge key={m} className="text-xs">
              {m}
            </Badge>
          ))}
        </div>
      </div>

      {/* Rating */}
      {place.reviewsCount > 0 && (
        <div className="shrink-0 text-right">
          <span className="text-warning">★</span>
          <span className="text-sm font-medium text-text-primary">{place.rating.toFixed(1)}</span>
        </div>
      )}
    </Link>
  );
}
