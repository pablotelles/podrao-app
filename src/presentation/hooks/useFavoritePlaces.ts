'use client';

import useSWR from 'swr';
import type { Place } from '@/domain/entities/Place';

async function fetcher(url: string): Promise<Place[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar favoritos');
  return res.json() as Promise<Place[]>;
}

export function useFavoritePlaces() {
  const { data, error, isLoading } = useSWR<Place[]>('/api/me/favorites', fetcher, {
    revalidateOnFocus: false,
  });

  return {
    places: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}
