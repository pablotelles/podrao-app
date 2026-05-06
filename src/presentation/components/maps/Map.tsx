'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import { createUserPinHtml, USER_PIN_SIZE, USER_PIN_ANCHOR } from './pins/userPin';
import { ACTIVE_TILE_PROVIDER } from './tileProviders';
import { createPlacePinHtml, getPinLeafletConfig, type PinSize } from './pins/placePin';

export interface MapMarker {
  lat: number;
  lng: number;
  id?: string;
  content?: string;
  draggable?: boolean;
  icon?: 'default' | 'user' | 'brand';
  pinSize?: PinSize;
  onClick?: () => void;
}

export interface MapConfig {
  center?: { lat: number; lng: number };
  zoom?: number;
  interactive?: boolean;
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

  const { center, zoom = 14, interactive = true, onClick, onMarkerDragEnd } = config;

  useEffect(() => {
    if (!containerRef.current) return;

    (async () => {
      const L = (await import('leaflet')).default;

      const buildIcon = (marker: MapMarker) => {
        if (marker.icon === 'user') {
          return L.divIcon({
            className: '',
            html: createUserPinHtml(),
            iconSize: USER_PIN_SIZE,
            iconAnchor: USER_PIN_ANCHOR,
          });
        }
        if (marker.icon === 'brand') {
          const cfg = getPinLeafletConfig(marker.pinSize ?? 'md');
          return L.divIcon({
            className: '',
            html: createPlacePinHtml(marker.pinSize ?? 'md'),
            ...cfg,
          });
        }
        return L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
      };

      const addMarkers = (map: LeafletMap) => {
        markers.forEach((marker) => {
          const icon = buildIcon(marker);
          const leafletMarker = L.marker([marker.lat, marker.lng], {
            icon,
            draggable: marker.draggable ?? false,
          });

          if (marker.content) {
            leafletMarker.bindPopup(marker.content, {
              maxWidth: 260,
              minWidth: 200,
              closeButton: true,
            });
          }

          if (marker.draggable && onMarkerDragEnd) {
            leafletMarker.on('dragend', () => {
              const pos = leafletMarker.getLatLng();
              onMarkerDragEnd(pos.lat, pos.lng);
            });
          }

          if (marker.onClick) {
            leafletMarker.on('click', marker.onClick);
          }

          leafletMarker.addTo(map);
          markersRef.current.push(leafletMarker);
        });
      };

      const fitMarkers = (map: LeafletMap) => {
        if (markers.length === 1 && !center) {
          // Um único marcador — zoom próximo fixo
          map.setView([markers[0].lat, markers[0].lng], 16);
          return;
        }

        if (markers.length < 2) return;

        const coords = markers.map((m) => [m.lat, m.lng] as [number, number]);
        const bounds = L.latLngBounds(coords);

        // Diagonal do bounding box em km — decide o quão próximo ficar
        const diagonalKm = map.distance(bounds.getNorthWest(), bounds.getSouthEast()) / 1000;

        // Quanto menor a diagonal, mais podemos aproximar
        // < 0.5 km → zoom 17 | < 2 km → 16 | < 8 km → 15 | maior → 13
        const maxZoom = diagonalKm < 0.5 ? 17 : diagonalKm < 2 ? 16 : diagonalKm < 8 ? 15 : 13;

        map.fitBounds(bounds, { padding: [52, 52], maxZoom });
      };

      // --- Atualizar mapa existente ---
      if (mapRef.current) {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        addMarkers(mapRef.current);
        fitMarkers(mapRef.current);
        return;
      }

      // --- Criar mapa pela primeira vez ---
      const initialCenter =
        center ??
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

      L.tileLayer(ACTIVE_TILE_PROVIDER.url, {
        maxZoom: ACTIVE_TILE_PROVIDER.maxZoom,
      }).addTo(map);

      if (onClick) {
        map.on('click', (e) => onClick(e.latlng.lat, e.latlng.lng));
      }

      addMarkers(map);
      fitMarkers(map);
      mapRef.current = map;
    })();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [markers, center, zoom, interactive, onClick, onMarkerDragEnd]);

  return (
    <>
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
