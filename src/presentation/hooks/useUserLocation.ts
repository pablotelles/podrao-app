'use client';

import { useContext } from 'react';
import { LocationContext } from '@/presentation/contexts/LocationContext';

export function useUserLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error('useUserLocation must be used within LocationProvider');
  }

  return context;
}
