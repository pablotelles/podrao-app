'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { MapSkeleton } from './MapSkeleton';
import L from 'leaflet';
import { createUserPinHtml, USER_PIN_SIZE, USER_PIN_ANCHOR } from './pins/userPin';
import { ACTIVE_TILE_PROVIDER } from './tileProviders';
import { createPlacePinHtml, getPinLeafletConfig, type PinSize } from './pins/placePin';

export interface MapMarker {
  lat: number;
  lng: number;
  id?: string;
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
  userLat?: number | null;
  userLng?: number | null;
  flyToCenter?: { lat: number; lng: number } | null;
}

// ── Internal sub-components (must live inside MapContainer) ──────────────────

const LOCATE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="4"/></svg>`;

function CenterControl({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    const CenterControlClass = L.Control.extend({
      onAdd() {
        const btn = L.DomUtil.create('button', '') as HTMLButtonElement;
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Centralizar na minha localização');
        btn.innerHTML = LOCATE_SVG;
        btn.style.cssText = [
          'background:var(--color-bg)',
          'border:none',
          'border-radius:50%',
          'box-shadow:0 2px 8px rgba(0,0,0,.15)',
          'cursor:pointer',
          'width:36px',
          'height:36px',
          'display:flex',
          'align-items:center',
          'justify-content:center',
          'margin-bottom:8px',
          'margin-right:8px',
        ].join(';');
        L.DomEvent.disableClickPropagation(btn);
        L.DomEvent.on(btn, 'click', () => map.setView([lat, lng], map.getZoom()));
        return btn;
      },
    });

    const ctrl = new CenterControlClass({ position: 'bottomright' });
    ctrl.addTo(map);
    return () => {
      ctrl.remove();
    };
  }, [map, lat, lng]);

  return null;
}

function TileLoadTracker({ onLoaded }: { onLoaded: () => void }) {
  const firedRef = { current: false };
  return (
    <TileLayer
      url={ACTIVE_TILE_PROVIDER.url}
      maxZoom={ACTIVE_TILE_PROVIDER.maxZoom}
      eventHandlers={{
        load: () => {
          if (!firedRef.current) {
            firedRef.current = true;
            onLoaded();
          }
        },
      }}
    />
  );
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prevRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = { lat, lng };
    if (!prev) return; // skip initial mount
    if (Math.abs(lat - prev.lat) > 1e-7 || Math.abs(lng - prev.lng) > 1e-7) {
      map.flyTo([lat, lng], map.getZoom(), { duration: 0.5 });
    }
  }, [lat, lng, map]);

  return null;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FitBounds({
  markers,
  center,
}: {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 1 && !center) {
      map.setView([markers[0].lat, markers[0].lng], 16);
      return;
    }
    if (markers.length < 2) return;

    const coords = markers.map((m) => [m.lat, m.lng] as [number, number]);
    const bounds = L.latLngBounds(coords);
    const diagonalKm = map.distance(bounds.getNorthWest(), bounds.getSouthEast()) / 1000;
    const maxZoom = diagonalKm < 0.5 ? 17 : diagonalKm < 2 ? 16 : diagonalKm < 8 ? 15 : 13;
    map.fitBounds(bounds, { padding: [52, 52], maxZoom });
  }, [markers, center, map]);

  return null;
}

function MapMarkerItem({
  marker,
  onDragEnd,
}: {
  marker: MapMarker;
  onDragEnd?: (lat: number, lng: number) => void;
}) {
  const icon = useMemo(() => {
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
  }, [marker.icon, marker.pinSize]);

  return (
    <Marker
      position={[marker.lat, marker.lng]}
      draggable={marker.draggable ?? false}
      icon={icon}
      eventHandlers={{
        dragend: (e) => {
          const pos = (e.target as L.Marker).getLatLng();
          onDragEnd?.(pos.lat, pos.lng);
        },
        click: marker.onClick,
      }}
    />
  );
}

// ── Public Map component ─────────────────────────────────────────────────────

export function Map({
  markers = [],
  config = {},
  height = '100%',
  className = '',
  userLat,
  userLng,
  flyToCenter,
}: MapProps) {
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const handleTilesLoaded = useCallback(() => setTilesLoaded(true), []);

  const { center, zoom = 14, interactive = true, onClick, onMarkerDragEnd } = config;

  const initialCenter =
    center ??
    (markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : { lat: -23.55, lng: -46.63 });

  return (
    <div className="relative" style={{ height, width: '100%' }}>
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={zoom}
        zoomControl={interactive}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        keyboard={interactive}
        attributionControl={false}
        style={{ height: '100%', width: '100%' }}
        className={className}
      >
        <TileLoadTracker onLoaded={handleTilesLoaded} />
        {onClick && <ClickHandler onClick={onClick} />}
        <FitBounds markers={markers} center={center} />
        {markers.map((marker, i) => (
          <MapMarkerItem key={marker.id ?? i} marker={marker} onDragEnd={onMarkerDragEnd} />
        ))}
        {userLat != null && userLng != null && <CenterControl lat={userLat} lng={userLng} />}
        {flyToCenter != null && <FlyTo lat={flyToCenter.lat} lng={flyToCenter.lng} />}
      </MapContainer>

      {/* Skeleton overlay — shown until first tile batch loads. Comes after
          MapContainer in DOM so it paints on top without needing z-index. */}
      {!tilesLoaded && (
        <div className="absolute inset-0">
          <MapSkeleton />
        </div>
      )}
    </div>
  );
}
