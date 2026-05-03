'use client';

import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

interface LocationContextValue {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => void;
  clearError: () => void;
}

export const LocationContext = createContext<LocationContextValue | null>(null);

interface LocationProviderProps {
  children: ReactNode;
  updateIntervalMs?: number; // Override via prop ou usa env var
  enableAutoUpdate?: boolean; // Se true, usa watchPosition; se false, só getCurrentPosition
}

export function LocationProvider({
  children,
  updateIntervalMs = Number(process.env.NEXT_PUBLIC_LOCATION_UPDATE_INTERVAL_MS) || 30000,
  enableAutoUpdate = true,
}: LocationProviderProps) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    });
    setIsLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let message = 'Erro ao obter localização';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        message = 'Permissão de localização negada';
        break;
      case err.POSITION_UNAVAILABLE:
        message = 'Localização indisponível';
        break;
      case err.TIMEOUT:
        message = 'Tempo esgotado ao buscar localização';
        break;
    }

    setError(message);
    setIsLoading(false);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo navegador');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 5000,
    });
  }, [handleSuccess, handleError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-update com watchPosition ou intervalo
  useEffect(() => {
    if (!enableAutoUpdate || typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }

    let watchId: number | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    // Primeira leitura imediata
    requestLocation();

    // Se suporta watchPosition, usa ele (mais eficiente)
    if (navigator.geolocation.watchPosition) {
      watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: updateIntervalMs,
      });
    } else {
      // Fallback: polling manual
      intervalId = setInterval(() => {
        requestLocation();
      }, updateIntervalMs);
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [enableAutoUpdate, updateIntervalMs, requestLocation, handleSuccess, handleError]);

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        error,
        requestLocation,
        clearError,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}
