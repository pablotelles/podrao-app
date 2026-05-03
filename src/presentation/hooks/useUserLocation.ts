'use client';

import { useContext } from 'react';
import { LocationContext } from '@/presentation/contexts/LocationContext';

/**
 * Hook para acessar a localização global do usuário.
 *
 * @throws Error se usado fora do LocationProvider
 *
 * @example
 * ```tsx
 * const { location, isLoading, error, requestLocation } = useUserLocation();
 *
 * if (isLoading) return <p>Obtendo localização...</p>;
 * if (error) return <p>Erro: {error}</p>;
 * if (!location) return <button onClick={requestLocation}>Permitir localização</button>;
 *
 * return <p>Você está em: {location.lat}, {location.lng}</p>;
 * ```
 */
export function useUserLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error('useUserLocation must be used within LocationProvider');
  }

  return context;
}
