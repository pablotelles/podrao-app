'use client';

import useSWR from 'swr';
import type { ListPlace } from '@/domain/entities/List';

async function fetcher(url: string): Promise<ListPlace[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar lugares da lista');
  return res.json() as Promise<ListPlace[]>;
}

export function useListPlaces(listId: string | null) {
  const url = listId ? `/api/lists/${listId}/places` : null;
  const { data, error, isLoading, mutate } = useSWR<ListPlace[]>(url, fetcher, {
    revalidateOnFocus: false,
  });

  const addPlace = async (placeId: string, note?: string) => {
    if (!listId) return;

    const res = await fetch(`/api/lists/${listId}/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeId, note }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error ?? 'Erro ao adicionar lugar à lista');
    }

    const newPlace = (await res.json()) as ListPlace;

    // Optimistic update
    mutate([...(data ?? []), newPlace], false);
    return newPlace;
  };

  const removePlace = async (placeId: string) => {
    if (!listId) return;

    // Optimistic update
    const currentPlaces = data ?? [];
    mutate(
      currentPlaces.filter((p) => p.placeId !== placeId),
      false,
    );

    try {
      const res = await fetch(`/api/lists/${listId}/places/${placeId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao remover lugar da lista');

      // Revalidar
      mutate();
    } catch (err) {
      // Rollback
      mutate(currentPlaces, false);
      throw err;
    }
  };

  return {
    places: data ?? [],
    addPlace,
    removePlace,
    isLoading,
    error,
    refresh: mutate,
  };
}
