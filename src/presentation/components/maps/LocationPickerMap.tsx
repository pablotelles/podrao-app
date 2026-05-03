'use client';

/**
 * LocationPickerMap — mapa Leaflet com pin único e arrastável.
 *
 * - Arrastando o pin chama onLocationChange(lat, lng)
 * - Clicando no mapa move o pin e chama onLocationChange
 * - Quando as props lat/lng mudam externamente (ex: GPS), pan + reposiciona o pin
 *
 * Deve ser importado com dynamic() + ssr:false pois Leaflet depende de window.
 *
 * Exemplo:
 *   const LocationPickerMap = dynamic(
 *     () => import('@/presentation/components/maps/LocationPickerMap'),
 *     { ssr: false },
 *   );
 */

import { useEffect, useRef } from 'react';

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markerRef = useRef<import('leaflet').Marker | null>(null);

  // Mantém o callback sempre atualizado sem re-montar o mapa
  const callbackRef = useRef(onLocationChange);
  useEffect(() => {
    callbackRef.current = onLocationChange;
  }, [onLocationChange]);

  // Monta o mapa uma única vez
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('leaflet').then((L) => {
      if (!containerRef.current) return;

      // Corrige ícones padrão quebrados no bundler
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 17,
        zoomControl: true,
      });

      L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

      // Drag: atualiza coordenadas no form
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        callbackRef.current(pos.lat, pos.lng);
      });

      // Clique no mapa: move o pin
      map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        callbackRef.current(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // monta uma vez — lat/lng iniciais são capturados aqui

  // Sincroniza posição quando as props mudam (ex: GPS preencheu o form)
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const current = marker.getLatLng();
    // Evita loop infinito: ignora se a posição já está correta
    if (Math.abs(current.lat - lat) < 1e-7 && Math.abs(current.lng - lng) < 1e-7) return;

    marker.setLatLng([lat, lng]);
    map.panTo([lat, lng]);
  }, [lat, lng]);

  return (
    <>
      {/* CSS do Leaflet — carregado uma vez no browser */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div className="relative overflow-hidden rounded-md border border-border">
        <div ref={containerRef} style={{ height, width: '100%' }} />
        <p className="pointer-events-none absolute bottom-2 left-1/2 z-[1000] -translate-x-1/2 whitespace-nowrap rounded-full bg-bg/90 px-3 py-1 text-xs text-text-secondary backdrop-blur-sm">
          Arraste o pin ou toque no mapa para ajustar
        </p>
      </div>
    </>
  );
}
