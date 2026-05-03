'use client';

import { useMemo } from 'react';
import { useUserLocation } from '@/presentation/hooks/useUserLocation';

/**
 * Calcula a distância entre dois pontos geográficos usando a fórmula de Haversine.
 * @param lat1 Latitude do ponto 1
 * @param lng1 Longitude do ponto 1
 * @param lat2 Latitude do ponto 2
 * @param lng2 Longitude do ponto 2
 * @returns Distância em metros
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Retorna em metros, arredondado
}

/**
 * Formata distância em metros para string legível (ex: "350 m" ou "1.2 km").
 * @param meters Distância em metros
 * @returns String formatada
 */
export function formatDistance(meters: number | null | undefined): string {
  if (meters == null) return '';
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Hook para calcular a distância entre a localização do usuário e um ponto.
 *
 * @param targetLat Latitude do destino
 * @param targetLng Longitude do destino
 * @returns Objeto com distância em metros e string formatada
 *
 * @example
 * ```tsx
 * const { distanceM, distanceText, hasUserLocation } = useDistance(place.lat, place.lng);
 *
 * if (hasUserLocation) {
 *   return <p>{distanceText} de você</p>; // "350 m de você"
 * }
 * ```
 */
export function useDistance(targetLat: number, targetLng: number) {
  const { location } = useUserLocation();

  const distanceM = useMemo(() => {
    if (!location) return null;
    return calculateDistance(location.lat, location.lng, targetLat, targetLng);
  }, [location, targetLat, targetLng]);

  const distanceText = useMemo(() => formatDistance(distanceM), [distanceM]);

  return {
    distanceM,
    distanceText,
    hasUserLocation: !!location,
  };
}
