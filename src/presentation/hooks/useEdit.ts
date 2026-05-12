'use client';

import useSWR from 'swr';
import type { PlaceEditWithVotes } from '@/domain/entities/PlaceEdit';

async function fetcher(url: string): Promise<{ edit: PlaceEditWithVotes }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar edição');
  return res.json() as Promise<{ edit: PlaceEditWithVotes }>;
}

export function useEdit(editId: string) {
  const { data, error, mutate } = useSWR<{ edit: PlaceEditWithVotes }>(
    editId ? `/api/edits/${editId}` : null,
    fetcher,
  );

  return {
    edit: data?.edit,
    isLoading: !data && !error,
    error,
    refresh: mutate,
  };
}
