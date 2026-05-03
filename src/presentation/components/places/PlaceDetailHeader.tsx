'use client';

import dynamic from 'next/dynamic';

const PlaceDetailMap = dynamic(
  () => import('@/presentation/components/places/PlaceDetailMap').then((m) => m.PlaceDetailMap),
  {
    ssr: false,
    loading: () => <div className="h-56 w-full animate-pulse bg-bg-subtle" />,
  },
);

interface PlaceDetailHeaderProps {
  lat: number;
  lng: number;
  name: string;
}

export function PlaceDetailHeader({ lat, lng, name }: PlaceDetailHeaderProps) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="relative h-56 w-full overflow-hidden">
      <PlaceDetailMap lat={lat} lng={lng} name={name} />

      {/* Botão "Como chegar" sobreposto ao mapa */}
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
