'use client';

import { useMemo } from 'react';
import type { Place } from '@/domain/entities/Place';
import { Map, type MapMarker } from '@/presentation/components/maps/Map';
import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';

interface PlaceMapProps {
  places: Place[];
  userLat?: number | null;
  userLng?: number | null;
  height?: string;
  onPlaceClick?: (place: Place) => void;
}

function buildPopupHtml(place: Place): string {
  const price = PRICE_BUCKET_LABELS[place.priceBucket];
  const rating =
    place.reviewsCount > 0
      ? `<span style="color:#d97706;font-size:12px;">★ ${place.rating.toFixed(1)}</span>
         <span style="color:#9ca3af;font-size:11px;">(${place.reviewsCount})</span>`
      : '';
  const bairro = place.bairro
    ? `<p style="margin:2px 0 0;font-size:12px;color:#6b7280;">${place.bairro}</p>`
    : '';

  return `
    <div style="padding:12px 14px;min-width:180px;font-family:ui-sans-serif,system-ui,sans-serif;">
      <p style="margin:0;font-size:14px;font-weight:600;color:#111827;line-height:1.3;">${place.name}</p>
      ${bairro}
      <div style="display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap;">
        <span style="
          background:#fff7ed;color:#f97316;
          font-size:11px;font-weight:500;
          padding:2px 8px;border-radius:999px;
          border:1px solid #fed7aa;
        ">${price}</span>
        ${rating}
      </div>
    </div>
  `.trim();
}

export default function PlaceMap({
  places,
  userLat,
  userLng,
  height = '100%',
  onPlaceClick,
}: PlaceMapProps) {
  const markers: MapMarker[] = useMemo(() => {
    const result: MapMarker[] = [];

    if (userLat != null && userLng != null) {
      result.push({ lat: userLat, lng: userLng, icon: 'user', id: 'user-location' });
    }

    places.forEach((place) => {
      if (place.lat == null || place.lng == null) return;
      result.push({
        lat: place.lat,
        lng: place.lng,
        id: place.id,
        icon: 'brand',
        content: buildPopupHtml(place),
        onClick: onPlaceClick ? () => onPlaceClick(place) : undefined,
      });
    });

    return result;
  }, [places, userLat, userLng]);

  const center = useMemo(() => {
    if (userLat != null && userLng != null) return { lat: userLat, lng: userLng };
    if (places.length > 0) return { lat: places[0].lat, lng: places[0].lng };
    return { lat: -15.7801, lng: -47.9292 };
  }, [userLat, userLng, places]);

  return (
    <Map
      markers={markers}
      config={{ center: markers.length > 1 ? undefined : center, zoom: 14 }}
      height={height}
    />
  );
}
