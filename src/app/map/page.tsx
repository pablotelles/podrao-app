'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useUserLocation } from '@/presentation/hooks/useUserLocation';
import { useNearbyPlaces } from '@/presentation/hooks/useNearbyPlaces';
import { useSearchRadius } from '@/presentation/hooks/useSearchRadius';
import { DynamicPlaceMap } from '@/presentation/components/maps/dynamic';
import { MapSkeleton } from '@/presentation/components/maps/MapSkeleton';
import type { Place } from '@/domain/entities/Place';

export default function MapPage() {
  const router = useRouter();
  const { location, initializing } = useUserLocation();
  const { radius } = useSearchRadius();
  const hasLocation = location != null;

  const { places } = useNearbyPlaces(
    hasLocation ? { lat: location!.lat, lng: location!.lng, radiusMeters: radius } : null,
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

      {(initializing || !hasLocation) && <MapSkeleton />}

      {!initializing && hasLocation && (
        <DynamicPlaceMap
          places={places}
          userLat={location!.lat}
          userLng={location!.lng}
          height="100%"
          onPlaceClick={handlePlaceClick}
        />
      )}
    </div>
  );
}
