'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useGeolocation } from '@/presentation/hooks/useGeolocation';
import { useNearbyPlaces } from '@/presentation/hooks/useNearbyPlaces';
import { DynamicPlaceMap } from '@/presentation/components/maps/dynamic';
import { MapSkeleton } from '@/presentation/components/maps/MapSkeleton';
import type { Place } from '@/domain/entities/Place';

export default function MapPage() {
  const router = useRouter();
  const geo = useGeolocation();
  const hasLocation = geo.lat != null && geo.lng != null;

  const { places } = useNearbyPlaces(
    hasLocation ? { lat: geo.lat!, lng: geo.lng!, radiusMeters: 5000 } : null,
  );

  function handlePlaceClick(place: Place) {
    router.push(place.slug ? `/p/${place.slug}` : `/places/${place.id}`);
  }

  // Reset subheader height — this page has no subheader
  useEffect(() => {
    document.documentElement.style.setProperty('--subheader-height', '0px');
    return () => {
      document.documentElement.style.setProperty('--subheader-height', '0px');
    };
  }, []);

  return (
    <div className="relative" style={{ height: 'calc(100dvh - var(--topbar-height))' }}>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        aria-label="Voltar"
        className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-bg shadow-(--shadow-card)"
        style={{ zIndex: 'var(--z-sticky)' }}
      >
        <ArrowLeft size={18} className="text-text-primary" />
      </button>

      {(geo.initializing || !hasLocation) && <MapSkeleton />}

      {!geo.initializing && hasLocation && (
        <DynamicPlaceMap
          places={places}
          userLat={geo.lat}
          userLng={geo.lng}
          height="100%"
          onPlaceClick={handlePlaceClick}
        />
      )}
    </div>
  );
}
