'use client';

import useSWR from 'swr';
import type { Place } from '@/domain/entities/Place';

async function fetcher(url: string): Promise<Place[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar lugares');
  return res.json() as Promise<Place[]>;
}

export function useMyPlaces() {
  const { data, error, isLoading } = useSWR<Place[]>('/api/me/places', fetcher, {
    revalidateOnFocus: false,
  });

  return {
    places: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}
