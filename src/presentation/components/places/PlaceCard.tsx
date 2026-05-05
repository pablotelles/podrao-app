import Link from 'next/link';
import Image from 'next/image';
import type { Place } from '@/domain/entities/Place';
import { Card, Badge, PlaceRating } from '@/presentation/components/ui';
import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import { useDistance } from '@/presentation/hooks/useDistance';

interface PlaceCardProps {
  place: Place;
}

export function PlaceCard({ place }: PlaceCardProps) {
  const { distanceText, hasUserLocation } = useDistance(place.lat, place.lng);
  return (
    <Link href={`/places/${place.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        {place.logoUrl ? (
          <div className="relative h-40 w-full">
            <Image
              src={place.logoUrl}
              alt={place.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div className="h-40 w-full bg-bg-subtle" />
        )}
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-text-primary leading-tight">{place.name}</h3>
            {hasUserLocation && (
              <span className="shrink-0 text-xs text-text-secondary">{distanceText}</span>
            )}
          </div>

          {place.bairro && <p className="text-xs text-text-secondary">{place.bairro}</p>}

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="brand">{PRICE_BUCKET_LABELS[place.priceBucket]}</Badge>
            {place.mealTypes.slice(0, 2).map((m) => (
              <Badge key={m}>{m}</Badge>
            ))}
          </div>

          <PlaceRating rating={place.rating} reviewsCount={place.reviewsCount} />
        </div>
      </Card>
    </Link>
  );
}
