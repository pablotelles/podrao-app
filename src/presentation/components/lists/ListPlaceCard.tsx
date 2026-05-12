'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MoreVertical, MapPin, ExternalLink, Map, Trash2 } from 'lucide-react';
import type { Place } from '@/domain/entities/Place';
import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import { ActionSheet } from '@/presentation/components/ui/ActionSheet';
import { PlaceRating } from '@/presentation/components/ui/PlaceRating';

interface ListPlaceCardProps {
  place: Place;
  listId: string;
  isOwner: boolean;
}

function formatDistance(m?: number): string | null {
  if (m == null) return null;
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function PlaceSheetHeader({ place }: { place: Place }) {
  const distance = formatDistance(place.distanceM);
  const meta = [PRICE_BUCKET_LABELS[place.priceBucket], distance].filter(Boolean).join(' · ');
  const subtitle = [place.establishmentType, place.bairro].filter(Boolean).join(' · ');

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-bg-subtle">
        {place.logoUrl ? (
          <Image src={place.logoUrl} alt={place.name} fill className="object-cover" sizes="56px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPin className="h-5 w-5 text-text-secondary" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-text-primary leading-tight">{place.name}</p>
        {subtitle && <p className="mt-0.5 truncate text-xs text-text-secondary">{subtitle}</p>}
        {meta && <p className="mt-0.5 truncate text-xs text-text-secondary">{meta}</p>}
      </div>
    </div>
  );
}

export function ListPlaceCard({ place, listId, isOwner }: ListPlaceCardProps) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const distance = formatDistance(place.distanceM);
  const meta = [PRICE_BUCKET_LABELS[place.priceBucket], distance].filter(Boolean).join(' · ');
  const subtitle = [place.establishmentType, place.bairro].filter(Boolean).join(' · ');

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await fetch(`/api/lists/${listId}/places/${place.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao remover lugar');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(false);
    }
  };

  const actions = [
    {
      icon: <ExternalLink className="h-5 w-5" />,
      label: 'Ver detalhes do lugar',
      onClick: () => router.push(place.slug ? `/p/${place.slug}` : `/places/${place.id}`),
    },
    {
      icon: <Map className="h-5 w-5" />,
      label: 'Ver no mapa',
      onClick: () => {
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`,
          '_blank',
        );
      },
    },
    ...(isOwner
      ? [
          {
            icon: <Trash2 className="h-5 w-5" />,
            label: removing ? 'Removendo...' : 'Remover da lista',
            onClick: handleRemove,
            variant: 'danger' as const,
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="flex items-center gap-3 py-3">
        {/* Thumbnail */}
        <Link
          href={place.slug ? `/p/${place.slug}` : `/places/${place.id}`}
          className="relative h-16 w-16 shrink-0"
        >
          <div className="h-full w-full overflow-hidden rounded-xl bg-bg-subtle">
            {place.logoUrl ? (
              <Image
                src={place.logoUrl}
                alt={place.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <MapPin className="h-6 w-6 text-text-secondary" />
              </div>
            )}
          </div>
        </Link>

        {/* Info */}
        <Link
          href={place.slug ? `/p/${place.slug}` : `/places/${place.id}`}
          className="min-w-0 flex-1"
        >
          <p className="truncate font-semibold text-text-primary leading-tight">{place.name}</p>
          {subtitle && <p className="mt-0.5 truncate text-xs text-text-secondary">{subtitle}</p>}
          <div className="mt-0.5 flex items-center gap-1">
            <PlaceRating
              rating={place.rating}
              reviewsCount={place.reviewsCount}
              showCount={false}
            />
            {meta && (
              <span className="truncate text-xs text-text-secondary">
                {place.reviewsCount > 0 ? `· ${meta}` : meta}
              </span>
            )}
          </div>
        </Link>

        {/* Mais opções */}
        <button
          onClick={() => setSheetOpen(true)}
          className="shrink-0 rounded-lg p-1 text-text-secondary transition-colors hover:bg-bg-subtle"
          aria-label="Mais opções"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <ActionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        header={<PlaceSheetHeader place={place} />}
        actions={actions}
      />
    </>
  );
}
