import useSWR from 'swr';
import type { PendingPlaceItem } from '@/domain/entities/PendingPlaceItem';

async function fetcher(url: string): Promise<{ places: PendingPlaceItem[]; total: number }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao carregar lugares pendentes');
  return res.json() as Promise<{ places: PendingPlaceItem[]; total: number }>;
}

export function usePendingPlaces() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/admin/places?limit=100&offset=0',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  return {
    places: data?.places ?? [],
    total: data?.total ?? 0,
    error,
    isLoading,
    refresh: mutate,
  };
}
