'use client';

/**
 * PlaceMap — mapa interativo com Leaflet + tiles OSM via LocationIQ.
 * Importado com dynamic() + ssr:false pois Leaflet depende de window.
 *
 * Uso:
 *   import dynamic from 'next/dynamic';
 *   const PlaceMap = dynamic(() => import('./PlaceMap'), { ssr: false });
 */

import { useEffect, useRef } from 'react';
import type { Place } from '@/domain/entities/Place';

// Tiles gratuitos OpenStreetMap — sem cota, sem chave
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

interface PlaceMapProps {
  places: Place[];
  userLat?: number | null;
  userLng?: number | null;
  /** altura do mapa em CSS (default: 100%) */
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const userMarkerRef = useRef<import('leaflet').Marker | null>(null);
  const placeMarkersRef = useRef<import('leaflet').Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Importação dinâmica do Leaflet (só roda no browser)
    import('leaflet').then((L) => {
      // Corrige ícones padrão quebrados no bundler
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const center: [number, number] =
        userLat && userLng ? [userLat, userLng] : [-15.7801, -47.9292]; // Brasília como fallback

      const map = L.map(containerRef.current!, {
        center,
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      // Marcador da posição do usuário
      if (userLat && userLng) {
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `<div style="
            width:14px;height:14px;
            background:var(--color-brand,#f97316);
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 2px 6px rgba(0,0,0,.35);
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const userMarker = L.marker([userLat, userLng], { icon: userIcon })
          .addTo(map)
          .bindPopup('Você está aqui');
        userMarkerRef.current = userMarker;
      }

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
      placeMarkersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // monta uma vez

  // Atualiza markers quando places muda
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    import('leaflet').then((L) => {
      // Remove apenas os marcadores de lugares antigos
      for (const marker of placeMarkersRef.current) {
        map.removeLayer(marker);
      }
      placeMarkersRef.current = [];

      // Cria novos marcadores para cada lugar
      for (const place of places) {
        const marker = L.marker([place.lat, place.lng])
          .addTo(map)
          .bindPopup(
            `<strong>${place.name}</strong><br/>
             ${place.bairro ?? ''}<br/>
             <small>${place.mealTypes.join(', ')}</small>`,
            { maxWidth: 200 },
          );

        if (onPlaceClick) {
          marker.on('click', () => onPlaceClick(place));
        }

        placeMarkersRef.current.push(marker);
      }

      // Ajusta bounds para mostrar todos os lugares
      if (places.length > 0) {
        const coords = places.map((p): [number, number] => [p.lat, p.lng]);
        if (userLat && userLng) coords.push([userLat, userLng]);
        map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 15 });
      }
    });
  }, [places, userLat, userLng, onPlaceClick]);

  return (
    <>
      {/* CSS do Leaflet — carregado uma vez no browser */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={containerRef} style={{ height, width: '100%' }} />
    </>
  );
}
