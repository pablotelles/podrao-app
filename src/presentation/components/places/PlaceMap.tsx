'use client';

/**
 * PlaceMap — mapa interativo mostrando múltiplos lugares.
 * Importado com dynamic() + ssr:false pois Leaflet depende de window.
 */

import { useMemo } from 'react';
import type { Place } from '@/domain/entities/Place';
import { Map, type MapMarker } from '@/presentation/components/maps/Map';
import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';

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
  const markers: MapMarker[] = useMemo(() => {
    const result: MapMarker[] = [];

    // Marcador de usuário (se disponível)
    if (userLat != null && userLng != null) {
      result.push({
        lat: userLat,
        lng: userLng,
        icon: 'user',
        id: 'user-location',
      });
    }

    // Marcadores dos lugares
    places.forEach((place) => {
      if (place.lat == null || place.lng == null) return;

      const popup = `
        <div class="min-w-[200px] p-2">
          <h3 class="font-semibold text-sm">${place.name}</h3>
          <p class="text-xs text-text-secondary mt-1">${place.bairro || ''}</p>
          <div class="flex gap-1 mt-2 flex-wrap">
            <span class="px-2 py-0.5 text-xs rounded-full bg-brand/10 text-brand">${PRICE_BUCKET_LABELS[place.priceBucket]}</span>
            ${place.rating ? `<span class="text-xs text-warning">★ ${place.rating.toFixed(1)}</span>` : ''}
          </div>
        </div>
      `;

      result.push({
        lat: place.lat,
        lng: place.lng,
        id: place.id,
        content: popup,
        icon: 'brand',
      });
    });

    return result;
  }, [places, userLat, userLng]);

  // Auto-ajustar bounds para mostrar todos os marcadores
  const center = useMemo(() => {
    if (userLat != null && userLng != null) {
      return { lat: userLat, lng: userLng };
    }
    if (places.length > 0 && places[0].lat != null && places[0].lng != null) {
      return { lat: places[0].lat, lng: places[0].lng };
    }
    return { lat: -15.7801, lng: -47.9292 }; // Brasília fallback
  }, [userLat, userLng, places]);

  return (
    <Map
      markers={markers}
      config={{
        center: markers.length > 1 ? undefined : center,
        zoom: 14,
        interactive: true,
      }}
      height={height}
    />
  );
}
