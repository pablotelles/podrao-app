'use client';

import { useMemo, useState } from 'react';
import type { Place } from '@/domain/entities/Place';
import { Map, type MapMarker } from '@/presentation/components/maps/Map';
import { PlaceMapPopup } from './PlaceMapPopup';

interface PlaceMapProps {
  places: Place[];
  userLat?: number | null;
  userLng?: number | null;
  height?: string;
  onPlaceClick?: (place: Place) => void;
}

export default function PlaceMap({
  places,
  userLat,
  userLng,
  height = '100%',
  onPlaceClick,
}: PlaceMapProps) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const markers: MapMarker[] = useMemo(() => {
    const result: MapMarker[] = [];

    if (userLat != null && userLng != null) {
      result.push({ lat: userLat, lng: userLng, icon: 'user', id: 'user-location' });
    }

    places.forEach((place) => {
      if (place.lat == null || place.lng == null) return;
      result.push({
        lat: place.lat,
        lng: place.lng,
        id: place.id,
        icon: 'brand',
        onClick: () => setSelectedPlace(place),
      });
    });

    return result;
  }, [places, userLat, userLng]);

  const center = useMemo(() => {
    if (userLat != null && userLng != null) return { lat: userLat, lng: userLng };
    if (places.length > 0) return { lat: places[0].lat, lng: places[0].lng };
    return { lat: -15.7801, lng: -47.9292 };
  }, [userLat, userLng, places]);

  return (
    <div className="relative" style={{ height }}>
      <Map
        markers={markers}
        config={{ center: markers.length > 1 ? undefined : center, zoom: 14 }}
        height="100%"
      />

      {selectedPlace && (
        <div className="absolute bottom-4 left-4 right-4 z-1000">
          <PlaceMapPopup
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
            onViewMore={() => {
              onPlaceClick?.(selectedPlace);
              setSelectedPlace(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
