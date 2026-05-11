'use client';

import { useState, useEffect } from 'react';
import { Map, type MapMarker } from '@/presentation/components/maps/Map';

export interface LocationPickerMapProps {
  lat: number;
  lng: number;
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
    { lat: markerPosition.lat, lng: markerPosition.lng, draggable: true, icon: 'brand' },
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
        userLat={lat}
        userLng={lng}
        flyToCenter={{ lat, lng }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded bg-white/90 px-3 py-1.5 text-xs text-text-secondary shadow-sm"
        style={{ zIndex: 'var(--z-sticky)' }}
      >
        Arraste o pin ou toque no mapa
      </div>
    </div>
  );
}
