'use client';

import useSWR from 'swr';
import type { UserList } from '@/domain/entities/List';

async function fetcher(url: string): Promise<UserList[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar listas');
  return res.json() as Promise<UserList[]>;
}

export function usePublicLists() {
  const { data, error, isLoading } = useSWR<UserList[]>('/api/lists/public', fetcher, {
    revalidateOnFocus: false,
  });
  return { lists: data ?? [], isLoading, error: error as Error | null };
}

export function useSavedLists() {
  const { data, error, isLoading } = useSWR<UserList[]>('/api/me/saved-lists', fetcher, {
    revalidateOnFocus: false,
  });
  return { lists: data ?? [], isLoading, error: error as Error | null };
}
