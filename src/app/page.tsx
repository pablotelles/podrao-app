'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPinPlus, SlidersHorizontal, Map, List } from 'lucide-react';
import { useGeolocation } from '@/presentation/hooks/useGeolocation';
import { useNearbyPlaces } from '@/presentation/hooks/useNearbyPlaces';
import { useSubHeaderHeight } from '@/presentation/hooks/useSubHeaderHeight';
import { FilterBar, type FilterValues } from '@/presentation/components/filters/FilterBar';
import { PlaceList } from '@/presentation/components/places/PlaceList';
import { LocationSearch } from '@/presentation/components/location/LocationSearch';
import { MapSkeleton } from '@/presentation/components/maps/MapSkeleton';
import { DynamicPlaceMap } from '@/presentation/components/maps/dynamic';
import { Button } from '@/presentation/components/ui';
import { usePageTitle } from '@/presentation/contexts/TopBarContext';
import { SubHeaderPortal } from '@/presentation/components/navigation/SubHeaderPortal';
import type { Place } from '@/domain/entities/Place';

type ViewMode = 'list' | 'map';

export default function HomePage() {
  usePageTitle('Explorar');
  const geo = useGeolocation();
  const router = useRouter();
  const [filters, setFilters] = useState<FilterValues>({});
  const [view, setView] = useState<ViewMode>('map');
  const [filterOpen, setFilterOpen] = useState(false);
  const hasLocation = geo.lat != null && geo.lng != null;
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  useSubHeaderHeight(hasLocation ? 44 : 0);

  const { places, isLoading, error } = useNearbyPlaces(
    geo.lat && geo.lng
      ? {
          lat: geo.lat,
          lng: geo.lng,
          radiusMeters: filters.radiusMeters,
          mealType: filters.mealType,
          cuisine: filters.cuisine,
          foodType: filters.foodType,
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

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100dvh - var(--topbar-height) - var(--subheader-height))' }}
    >
      {/* SubHeader: A = filtros | B = mapa/lista | C = adicionar */}
      {hasLocation && (
        <SubHeaderPortal>
          <div className="grid grid-cols-3 items-center border-b border-border bg-bg px-(--spacing-page-x) h-[44px]">
            {/* A — filtros */}
            <div className="flex items-center">
              <button
                onClick={() => setFilterOpen(true)}
                className="relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-bg-subtle text-text-secondary"
                aria-label="Filtros"
              >
                <SlidersHorizontal size={18} />
                {activeFilterCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-text-inverse">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* B — toggle mapa/lista */}
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={() => setView('map')}
                className={
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors ' +
                  (view === 'map'
                    ? 'bg-brand text-text-inverse'
                    : 'text-text-secondary hover:bg-bg-subtle')
                }
                aria-label="Mapa"
              >
                <Map size={18} />
              </button>
              <button
                onClick={() => setView('list')}
                className={
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors ' +
                  (view === 'list'
                    ? 'bg-brand text-text-inverse'
                    : 'text-text-secondary hover:bg-bg-subtle')
                }
                aria-label="Lista"
              >
                <List size={18} />
              </button>
            </div>

            {/* C — adicionar */}
            <div className="flex items-center justify-end">
              <Button size="sm" onClick={() => router.push('/add-place')}>
                <MapPinPlus size={16} />
                Adicionar
              </Button>
            </div>
          </div>
        </SubHeaderPortal>
      )}

      {/* Sheet de filtros (controlado pelo ícone no SubHeader) */}
      {hasLocation && (
        <FilterBar
          values={filters}
          onChange={setFilters}
          open={filterOpen}
          onOpenChange={setFilterOpen}
        />
      )}

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
            <div className="flex-1 overflow-auto" style={{ isolation: 'isolate' }}>
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
