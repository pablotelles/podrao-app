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
  /** true until the first GPS attempt completes (success or error) */
  initializing: boolean;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => void;
  /** Manual override — used when the user searches by city/address */
  setLocation: (lat: number, lng: number) => void;
  clearError: () => void;
}

export const LocationContext = createContext<LocationContextValue | null>(null);

const SESSION_KEY = 'podrao:last-location';

function readSessionLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserLocation) : null;
  } catch {
    return null;
  }
}

function writeSessionLocation(loc: UserLocation) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(loc));
  } catch {
    // storage quota exceeded — ignore
  }
}

interface LocationProviderProps {
  children: ReactNode;
  updateIntervalMs?: number;
  enableAutoUpdate?: boolean;
}

export function LocationProvider({
  children,
  updateIntervalMs = Number(process.env.NEXT_PUBLIC_LOCATION_UPDATE_INTERVAL_MS) || 30000,
  enableAutoUpdate = true,
}: LocationProviderProps) {
  const sessionLoc = readSessionLocation();

  const [location, setLocationState] = useState<UserLocation | null>(sessionLoc);
  // If we already have a cached location, skip the skeleton on the first render
  const [initializing, setInitializing] = useState(!sessionLoc);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const loc: UserLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
    setLocationState(loc);
    writeSessionLocation(loc);
    setIsLoading(false);
    setError(null);
    setInitializing(false);
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
    setInitializing(false);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo navegador');
      setInitializing(false);
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

  const setLocation = useCallback((lat: number, lng: number) => {
    const loc: UserLocation = { lat, lng, timestamp: Date.now() };
    setLocationState(loc);
    writeSessionLocation(loc);
    setIsLoading(false);
    setError(null);
    setInitializing(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!enableAutoUpdate || typeof window === 'undefined' || !navigator.geolocation) {
      setInitializing(false);
      return;
    }

    let watchId: number | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    requestLocation();

    if (navigator.geolocation.watchPosition) {
      watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: updateIntervalMs,
      });
    } else {
      intervalId = setInterval(() => {
        requestLocation();
      }, updateIntervalMs);
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [enableAutoUpdate, updateIntervalMs, requestLocation, handleSuccess, handleError]);

  return (
    <LocationContext.Provider
      value={{
        location,
        initializing,
        isLoading,
        error,
        requestLocation,
        setLocation,
        clearError,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}
