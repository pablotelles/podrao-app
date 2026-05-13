'use client';

import { createContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';

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
// ~150m threshold: meaningful movement for a restaurant discovery app
const MOVE_THRESHOLD_DEG = 0.0015;
// Default refresh interval: 3 minutes
const DEFAULT_INTERVAL_MS = 180_000;

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

function hasMoved(prev: UserLocation, lat: number, lng: number): boolean {
  return (
    Math.abs(prev.lat - lat) > MOVE_THRESHOLD_DEG || Math.abs(prev.lng - lng) > MOVE_THRESHOLD_DEG
  );
}

interface LocationProviderProps {
  children: ReactNode;
  updateIntervalMs?: number;
  enableAutoUpdate?: boolean;
}

export function LocationProvider({
  children,
  updateIntervalMs = DEFAULT_INTERVAL_MS,
  enableAutoUpdate = true,
}: LocationProviderProps) {
  const sessionLoc = readSessionLocation();

  const [location, setLocationState] = useState<UserLocation | null>(sessionLoc);
  const [initializing, setInitializing] = useState(!sessionLoc);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevLocationRef = useRef<UserLocation | null>(sessionLoc);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const prev = prevLocationRef.current;

    // Only update state if user has moved meaningfully (~150m)
    if (prev && !hasMoved(prev, lat, lng)) {
      setIsLoading(false);
      setInitializing(false);
      return;
    }

    const loc: UserLocation = {
      lat,
      lng,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
    prevLocationRef.current = loc;
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
      maximumAge: updateIntervalMs,
    });
  }, [handleSuccess, handleError, updateIntervalMs]);

  const setLocation = useCallback((lat: number, lng: number) => {
    const loc: UserLocation = { lat, lng, timestamp: Date.now() };
    prevLocationRef.current = loc;
    setLocationState(loc);
    writeSessionLocation(loc);
    setIsLoading(false);
    setError(null);
    setInitializing(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Periodic getCurrentPosition — no watchPosition (not a navigation app)
  useEffect(() => {
    if (!enableAutoUpdate || typeof window === 'undefined' || !navigator.geolocation) {
      setInitializing(false);
      return;
    }

    requestLocation();

    const intervalId = setInterval(() => {
      requestLocation();
    }, updateIntervalMs);

    // Refresh when the user returns to the tab/app after being away
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestLocation();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enableAutoUpdate, updateIntervalMs, requestLocation]);

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
