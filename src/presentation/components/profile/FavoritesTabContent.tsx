'use client';

import { useFavoritePlaces } from '@/presentation/hooks/useFavoritePlaces';
import { PlaceList } from '@/presentation/components/places/PlaceList';

export function FavoritesTabContent() {
  const { places, isLoading, error } = useFavoritePlaces();

  return (
    <div className="px-(--spacing-page-x) py-4">
      <PlaceList places={places} isLoading={isLoading} error={error} />
    </div>
  );
}
