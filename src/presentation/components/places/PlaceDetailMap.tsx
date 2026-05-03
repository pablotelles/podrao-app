'use client';

import { Map } from '@/presentation/components/maps/Map';

interface PlaceDetailMapProps {
  lat: number;
  lng: number;
  name: string;
}

export function PlaceDetailMap({ lat, lng, name }: PlaceDetailMapProps) {
  return (
    <Map
      markers={[{ lat, lng, icon: 'brand' }]}
      config={{ center: { lat, lng }, zoom: 16, interactive: false }}
      height="100%"
      className="relative overflow-hidden"
    />
  );
}
