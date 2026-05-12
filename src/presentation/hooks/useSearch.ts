'use client';

import useSWR from 'swr';
import type { Place } from '@/domain/entities/Place';
import type { UserList } from '@/domain/entities/List';
import { useDebounce } from './useDebounce';

interface SearchResult {
  places: Place[];
  lists: UserList[];
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Falha na busca');
    return res.json() as Promise<SearchResult>;
  });

export function useSearch(query: string) {
  const debounced = useDebounce(query, 300);
  const shouldFetch = debounced.trim().length >= 2;

  const { data, isLoading, error } = useSWR<SearchResult>(
    shouldFetch ? `/api/search?q=${encodeURIComponent(debounced.trim())}` : null,
    fetcher,
  );

  return {
    places: data?.places ?? [],
    lists: data?.lists ?? [],
    isLoading: shouldFetch && isLoading,
    error,
  };
}
