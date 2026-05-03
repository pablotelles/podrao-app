'use client';

import { useState, useCallback, useEffect } from 'react';

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
  /** true enquanto o request automático ainda não retornou */
  initializing: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    error: null,
    loading: false,
    initializing: true,
  });

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        error: 'Geolocalização não suportada pelo navegador',
        loading: false,
        initializing: false,
      }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
          loading: false,
          initializing: false,
        });
      },
      () => {
        setState((s) => ({
          ...s,
          error: 'Permissão de localização negada',
          loading: false,
          initializing: false,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  /** Define localização manualmente (busca por cidade/endereço) */
  const setLocation = useCallback((lat: number, lng: number) => {
    setState({ lat, lng, error: null, loading: false, initializing: false });
  }, []);

  // Solicita automaticamente ao montar
  useEffect(() => {
    request();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, request, setLocation };
}
