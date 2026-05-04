'use client';

import { useMyPlaces } from '@/presentation/hooks/useMyPlaces';
import { PlaceList } from '@/presentation/components/places/PlaceList';

export function PlacesTabContent() {
  const { places, isLoading, error } = useMyPlaces();

  return (
    <div className="px-(--spacing-page-x) py-4">
      <PlaceList places={places} isLoading={isLoading} error={error} />
    </div>
  );
}
