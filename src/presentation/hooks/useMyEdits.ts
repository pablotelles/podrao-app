'use client';

import useSWR from 'swr';
import type { PlaceEditWithPlace } from '@/domain/entities/PlaceEdit';

async function fetcher(url: string): Promise<{ edits: PlaceEditWithPlace[] }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar sugestões');
  return res.json() as Promise<{ edits: PlaceEditWithPlace[] }>;
}

export function useMyEdits() {
  const { data, error, mutate } = useSWR<{ edits: PlaceEditWithPlace[] }>(
    '/api/profile/edits',
    fetcher,
  );

  return {
    edits: data?.edits ?? [],
    isLoading: !data && !error,
    error: error as Error | undefined,
    refresh: mutate,
  };
}
