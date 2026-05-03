'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGeolocation } from '@/presentation/hooks/useGeolocation';
import { useNearbyPlaces } from '@/presentation/hooks/useNearbyPlaces';
import { FilterBar, type FilterValues } from '@/presentation/components/filters/FilterBar';
import { PlaceList } from '@/presentation/components/places/PlaceList';
import { Button } from '@/presentation/components/ui';

export default function HomePage() {
  const geo = useGeolocation();
  const [filters, setFilters] = useState<FilterValues>({});

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

  return (
    <main className="mx-auto max-w-2xl px-(--spacing-page-x) pb-24 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Onde Comer</h1>
        <Link href="/add-place">
          <Button size="sm">+ Cadastrar</Button>
        </Link>
      </header>

      {!geo.lat && (
        <div className="mb-6 rounded-lg bg-brand-subtle p-4">
          <p className="mb-3 text-sm text-text-primary">
            Precisamos da sua localização para mostrar lugares próximos.
          </p>
          <Button onClick={geo.request} disabled={geo.loading} size="sm">
            {geo.loading ? 'Buscando...' : 'Usar minha localização'}
          </Button>
          {geo.error && <p className="mt-2 text-xs text-error">{geo.error}</p>}
        </div>
      )}

      {geo.lat && (
        <div className="mb-4">
          <FilterBar values={filters} onChange={setFilters} />
        </div>
      )}

      <PlaceList places={places} isLoading={geo.lat ? isLoading : false} error={error} />
    </main>
  );
}
