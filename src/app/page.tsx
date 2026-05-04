'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '@/presentation/hooks/useGeolocation';
import { useNearbyPlaces } from '@/presentation/hooks/useNearbyPlaces';
import { FilterBar, type FilterValues } from '@/presentation/components/filters/FilterBar';
import { PlaceList } from '@/presentation/components/places/PlaceList';
import { LocationSearch } from '@/presentation/components/location/LocationSearch';
import { MapSkeleton } from '@/presentation/components/maps/MapSkeleton';
import { DynamicPlaceMap } from '@/presentation/components/maps/dynamic';
import { Button } from '@/presentation/components/ui';
import type { Place } from '@/domain/entities/Place';

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
    <div className="flex h-dvh flex-col">
      {/* Header — mesmas classes do PageHeader */}
      <header className="shrink-0 flex items-center justify-between border-b border-border bg-bg px-(--spacing-page-x) py-4 sticky top-0 z-10">
        <h1 className="text-base font-bold text-text-primary">Onde Comer</h1>

        <div className="flex items-center gap-2">
          {hasLocation && (
            <div className="flex overflow-hidden rounded-full border border-border text-sm">
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

      {/* Conteúdo — pb-16 reserva espaço para o BottomNav fixo (h-16) */}
      <main className="flex flex-1 flex-col overflow-hidden pb-16">
        {geo.initializing && (
          <div className="flex-1">
            <MapSkeleton />
          </div>
        )}

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

        {!geo.initializing && hasLocation && (
          <>
            {view === 'list' && (
              <div className="shrink-0 border-b border-border px-(--spacing-page-x) py-3">
                <FilterBar values={filters} onChange={setFilters} />
              </div>
            )}

            <div className="flex-1 overflow-auto">
              {view === 'list' ? (
                <div className="mx-auto max-w-2xl px-(--spacing-page-x) py-4 pb-8">
                  <PlaceList places={places} isLoading={isLoading} error={error} />
                </div>
              ) : (
                <DynamicPlaceMap
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
    </div>
  );
}
