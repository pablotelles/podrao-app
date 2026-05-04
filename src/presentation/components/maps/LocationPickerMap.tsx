'use client';

/**
 * LocationPickerMap — mapa Leaflet com pin único e arrastável.
 *
 * - Arrastando o pin chama onLocationChange(lat, lng)
 * - Clicando no mapa move o pin e chama onLocationChange
 * - Quando as props lat/lng mudam externamente (ex: GPS), reposiciona o pin
 *
 * Deve ser importado com dynamic() + ssr:false pois Leaflet depende de window.
 */

import { useState, useEffect } from 'react';
import { Map, type MapMarker } from '@/presentation/components/maps/Map';

export interface LocationPickerMapProps {
  lat: number;
  lng: number;
  /** Chamado no dragend do pin ou ao clicar no mapa */
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

export default function LocationPickerMap({
  lat,
  lng,
  onLocationChange,
  height = '220px',
}: LocationPickerMapProps) {
  const [markerPosition, setMarkerPosition] = useState({ lat, lng });

  // Sincronizar quando props mudam (ex: GPS)
  useEffect(() => {
    const tolerance = 1e-7;
    if (
      Math.abs(lat - markerPosition.lat) > tolerance ||
      Math.abs(lng - markerPosition.lng) > tolerance
    ) {
      setMarkerPosition({ lat, lng });
    }
  }, [lat, lng, markerPosition]);

  const handleMarkerDrag = (newLat: number, newLng: number) => {
    setMarkerPosition({ lat: newLat, lng: newLng });
    onLocationChange(newLat, newLng);
  };

  const handleMapClick = (clickLat: number, clickLng: number) => {
    setMarkerPosition({ lat: clickLat, lng: clickLng });
    onLocationChange(clickLat, clickLng);
  };

  const markers: MapMarker[] = [
    {
      lat: markerPosition.lat,
      lng: markerPosition.lng,
      draggable: true,
      icon: 'brand',
    },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-md border border-border"
      style={{ zIndex: 'var(--z-base)' }}
    >
      <Map
        markers={markers}
        config={{
          center: markerPosition,
          zoom: 15,
          interactive: true,
          onClick: handleMapClick,
          onMarkerDragEnd: handleMarkerDrag,
        }}
        height={height}
      />
      {/* Hint text overlay */}
      <div className="pointer-events-none absolute left-1/2 top-3 z-500 -translate-x-1/2 rounded bg-white/90 px-3 py-1.5 text-xs text-text-secondary shadow-sm">
        Arraste o pin ou toque no mapa
      </div>
    </div>
  );
}
