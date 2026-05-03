'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

export interface MapMarker {
  lat: number;
  lng: number;
  id?: string;
  content?: string; // HTML popup
  draggable?: boolean;
  icon?: 'default' | 'user' | 'brand';
}

export interface MapConfig {
  center?: { lat: number; lng: number };
  zoom?: number;
  interactive?: boolean; // permite arrastar, zoom, etc
  onClick?: (lat: number, lng: number) => void;
  onMarkerDragEnd?: (lat: number, lng: number) => void;
}

interface MapProps {
  markers?: MapMarker[];
  config?: MapConfig;
  height?: string;
  className?: string;
}

export function Map({ markers = [], config = {}, height = '100%', className = '' }: MapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<LeafletMarker[]>([]);

  const { center, zoom = 13, interactive = true, onClick, onMarkerDragEnd } = config;

  // Criar/atualizar mapa
  useEffect(() => {
    if (!containerRef.current) return;

    (async () => {
      const L = (await import('leaflet')).default;

      // Se mapa já existe, apenas atualizar
      if (mapRef.current) {
        // Limpar marcadores antigos
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        // Adicionar novos marcadores
        markers.forEach((marker) => {
          const icon = getIcon(L, marker.icon);
          const leafletMarker = L.marker([marker.lat, marker.lng], {
            icon,
            draggable: marker.draggable || false,
          });

          if (marker.content) {
            leafletMarker.bindPopup(marker.content);
          }

          if (marker.draggable && onMarkerDragEnd) {
            leafletMarker.on('dragend', () => {
              const pos = leafletMarker.getLatLng();
              onMarkerDragEnd(pos.lat, pos.lng);
            });
          }

          leafletMarker.addTo(mapRef.current!);
          markersRef.current.push(leafletMarker);
        });

        // Ajustar bounds se múltiplos marcadores
        if (markers.length > 1) {
          const coords = markers.map((m) => [m.lat, m.lng] as [number, number]);
          mapRef.current.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 15 });
        } else if (markers.length === 1 && !center) {
          mapRef.current.setView([markers[0].lat, markers[0].lng], zoom);
        }

        return;
      }

      // Criar mapa pela primeira vez
      const initialCenter =
        center ||
        (markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : { lat: -23.55, lng: -46.63 });

      const map = L.map(containerRef.current!, {
        center: [initialCenter.lat, initialCenter.lng],
        zoom,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        touchZoom: interactive,
        keyboard: interactive,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      // Event listener para click no mapa
      if (onClick) {
        map.on('click', (e) => {
          onClick(e.latlng.lat, e.latlng.lng);
        });
      }

      // Adicionar marcadores
      markers.forEach((marker) => {
        const icon = getIcon(L, marker.icon);
        const leafletMarker = L.marker([marker.lat, marker.lng], {
          icon,
          draggable: marker.draggable || false,
        });

        if (marker.content) {
          leafletMarker.bindPopup(marker.content);
        }

        if (marker.draggable && onMarkerDragEnd) {
          leafletMarker.on('dragend', () => {
            const pos = leafletMarker.getLatLng();
            onMarkerDragEnd(pos.lat, pos.lng);
          });
        }

        leafletMarker.addTo(map);
        markersRef.current.push(leafletMarker);
      });

      // Ajustar bounds se múltiplos marcadores
      if (markers.length > 1 && !center) {
        const coords = markers.map((m) => [m.lat, m.lng] as [number, number]);
        map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 15 });
      }

      mapRef.current = map;
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [markers, center, zoom, interactive, onClick, onMarkerDragEnd]);

  return (
    <>
      {/* CSS do Leaflet */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={containerRef} style={{ height, width: '100%' }} className={className} />
    </>
  );
}

// Helper para criar ícones
function getIcon(L: any, type: MapMarker['icon'] = 'default') {
  if (type === 'user') {
    return L.divIcon({
      className: 'user-marker',
      html: `<div style="width: 12px; height: 12px; background: hsl(var(--warning)); border: 2px solid white; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
  }

  if (type === 'brand') {
    return L.divIcon({
      className: 'brand-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: hsl(var(--brand));
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <div style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(45deg);
            font-size: 16px;
            color: white;
          ">📍</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  }

  // default - ícone padrão do Leaflet (marker azul)
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}
