'use client';

import useSWR from 'swr';
import type { UserList } from '@/domain/entities/List';

async function fetcher(url: string): Promise<UserList[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar listas');
  return res.json() as Promise<UserList[]>;
}

export function useLists() {
  const { data, error, isLoading, mutate } = useSWR<UserList[]>('/api/lists', fetcher, {
    revalidateOnFocus: false,
  });

  const createList = async (name: string, description?: string, isPublic?: boolean) => {
    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, isPublic }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error ?? 'Erro ao criar lista');
    }

    const newList = (await res.json()) as UserList;

    // Optimistic update
    mutate([newList, ...(data ?? [])], false);
    return newList;
  };

  const deleteList = async (id: string) => {
    // Optimistic update
    const currentLists = data ?? [];
    mutate(
      currentLists.filter((l) => l.id !== id),
      false,
    );

    try {
      const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar lista');

      // Revalidar
      mutate();
    } catch (err) {
      // Rollback
      mutate(currentLists, false);
      throw err;
    }
  };

  const updateList = async (
    id: string,
    updateData: { name?: string; description?: string; isPublic?: boolean },
  ) => {
    const res = await fetch(`/api/lists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error ?? 'Erro ao atualizar lista');
    }

    const updatedList = (await res.json()) as UserList;

    // Optimistic update
    const currentLists = data ?? [];
    mutate(
      currentLists.map((l) => (l.id === id ? updatedList : l)),
      false,
    );

    return updatedList;
  };

  return {
    lists: data ?? [],
    createList,
    deleteList,
    updateList,
    isLoading,
    error,
    refresh: mutate,
  };
}
