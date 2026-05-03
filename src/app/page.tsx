'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '@/presentation/hooks/useGeolocation';
import { useNearbyPlaces } from '@/presentation/hooks/useNearbyPlaces';
import { FilterBar, type FilterValues } from '@/presentation/components/filters/FilterBar';
import { PlaceList } from '@/presentation/components/places/PlaceList';
import { LocationSearch } from '@/presentation/components/location/LocationSearch';
import { MapSkeleton } from '@/presentation/components/maps/MapSkeleton';
import { Button } from '@/presentation/components/ui';
import type { Place } from '@/domain/entities/Place';

const PlaceMap = dynamic(() => import('@/presentation/components/places/PlaceMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

type ViewMode = 'list' | 'map';

export default function HomePage() {
  const geo = useGeolocation();
  const router = useRouter();
  const [filters, setFilters] = useState<FilterValues>({});
  const [view, setView] = useState<ViewMode>('map');

  const { places, isLoading, error } = useNearbyPlaces(
    geo.lat && geo.lng
      ? {
          lat: geo.lat,
          lng: geo.lng,
          radiusMeters: filters.radiusMeters,
          mealType: filters.mealType,
          cuisine: filters.cuisine,
          maxPrice: filters.priceBucket
            ? { up_to_15: 15, '15_25': 25, '25_40': 40, '40_70': 70, '70_plus': undefined }[
                filters.priceBucket
              ]
            : undefined,
        }
      : null,
  );

  function handlePlaceClick(place: Place) {
    router.push('/places/' + place.id);
  }

  const hasLocation = geo.lat != null && geo.lng != null;

  return (
    <main className="flex h-dvh flex-col">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between px-(--spacing-page-x) py-4 border-b border-border bg-bg">
        <h1 className="text-lg font-bold text-text-primary">Onde Comer</h1>

        <div className="flex items-center gap-2">
          {hasLocation && (
            <div className="flex rounded-full border border-border overflow-hidden text-sm">
              <button
                onClick={() => setView('map')}
                className={
                  'px-3 py-1 transition-colors ' +
                  (view === 'map'
                    ? 'bg-brand text-text-inverse'
                    : 'text-text-secondary hover:bg-bg-subtle')
                }
              >
                Mapa
              </button>
              <button
                onClick={() => setView('list')}
                className={
                  'px-3 py-1 transition-colors ' +
                  (view === 'list'
                    ? 'bg-brand text-text-inverse'
                    : 'text-text-secondary hover:bg-bg-subtle')
                }
              >
                Lista
              </button>
            </div>
          )}
          <Link href="/add-place">
            <Button size="sm">+ Lugar</Button>
          </Link>
        </div>
      </header>

      {/* Skeleton enquanto aguarda GPS */}
      {geo.initializing && (
        <div className="flex-1">
          <MapSkeleton />
        </div>
      )}

      {/* GPS falhou — busca manual por cidade */}
      {!geo.initializing && !hasLocation && (
        <>
          <LocationSearch
            onLocation={(lat, lng) => geo.setLocation(lat, lng)}
            onRetry={geo.request}
            retrying={geo.loading}
          />
          <div className="flex-1 bg-bg-subtle" />
        </>
      )}

      {/* Localização disponível */}
      {!geo.initializing && hasLocation && (
        <>
          {view === 'list' && (
            <div className="shrink-0 px-(--spacing-page-x) py-3 border-b border-border">
              <FilterBar values={filters} onChange={setFilters} />
            </div>
          )}

          <div className="flex-1 overflow-auto">
            {view === 'list' ? (
              <div className="mx-auto max-w-2xl px-(--spacing-page-x) py-4 pb-24">
                <PlaceList places={places} isLoading={isLoading} error={error} />
              </div>
            ) : (
              <PlaceMap
                places={places}
                userLat={geo.lat}
                userLng={geo.lng}
                height="100%"
                onPlaceClick={handlePlaceClick}
              />
            )}
          </div>
        </>
      )}
    </main>
  );
}
