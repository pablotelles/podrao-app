'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Search } from 'lucide-react';
import { useUserLocation } from '@/presentation/hooks/useUserLocation';
import { useNearbyPlaces } from '@/presentation/hooks/useNearbyPlaces';
import { useSearchRadius } from '@/presentation/hooks/useSearchRadius';
import { DynamicPlaceMap } from '@/presentation/components/maps/dynamic';
import { MapSkeleton } from '@/presentation/components/maps/MapSkeleton';
import { Button } from '@/presentation/components/ui/Button';
import type { Place } from '@/domain/entities/Place';

export default function MapPage() {
  const router = useRouter();
  const { location, initializing, error, requestLocation } = useUserLocation();
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

  const isPermissionDenied = error?.toLowerCase().includes('negada');

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

      {initializing && <MapSkeleton />}

      {!initializing && !hasLocation && (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-(--spacing-page-x) text-center">
          <MapPin size={40} className="text-text-disabled" />
          <div className="flex flex-col gap-1">
            <p
              className="font-semibold text-text-primary"
              style={{ fontSize: 'var(--font-size-subheading)' }}
            >
              Localização necessária
            </p>
            <p className="text-text-secondary" style={{ fontSize: 'var(--font-size-label)' }}>
              {isPermissionDenied
                ? 'Você negou o acesso à localização. Ative nas configurações do navegador ou busque um endereço.'
                : 'Precisamos da sua localização para exibir o mapa.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full" style={{ maxWidth: '18rem' }}>
            {!isPermissionDenied && (
              <Button variant="primary" size="md" onClick={requestLocation}>
                <MapPin size={16} />
                Usar GPS
              </Button>
            )}
            <Button variant="secondary" size="md" onClick={() => router.push('/')}>
              <Search size={16} />
              Buscar endereço
            </Button>
          </div>
        </div>
      )}

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
