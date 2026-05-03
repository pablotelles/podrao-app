'use client';

import { useDistance } from '@/presentation/hooks/useDistance';
import { DynamicPlaceDetailMap } from '@/presentation/components/maps/dynamic';

interface PlaceDetailHeaderProps {
  lat: number;
  lng: number;
  name: string;
}

export function PlaceDetailHeader({ lat, lng, name }: PlaceDetailHeaderProps) {
  const { distanceText, hasUserLocation } = useDistance(lat, lng);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="relative h-48 w-full overflow-hidden">
      <DynamicPlaceDetailMap lat={lat} lng={lng} name={name} />

      {/* Distância - canto inferior esquerdo */}
      {hasUserLocation && (
        <div className="absolute bottom-4 left-3 z-[900] rounded-lg bg-white px-3 py-2 shadow-md">
          <div className="flex items-center gap-1.5 text-brand">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-xs font-semibold">{distanceText} de você</span>
          </div>
        </div>
      )}

      {/* Ícones de compartilhar e favoritar - topo direito */}
      <div className="absolute right-3 top-3 z-[900] flex gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105"
          aria-label="Compartilhar"
        >
          <svg
            className="h-5 w-5 text-text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105"
          aria-label="Favoritar"
        >
          <svg
            className="h-5 w-5 text-text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Botão "Como chegar" - parte inferior direita */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        Como chegar
      </a>
    </div>
  );
}
