'use client';

import useSWR from 'swr';
import type { ListSummaryDTO } from '@/application/dtos/ListDTO';

interface FeaturedListsResponse {
  items: ListSummaryDTO[];
}

async function fetcher(url: string): Promise<FeaturedListsResponse> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar listas em destaque');
  return res.json() as Promise<FeaturedListsResponse>;
}

interface UseFeaturedListsOptions {
  fallbackData?: ListSummaryDTO[];
}

export function useFeaturedLists({ fallbackData }: UseFeaturedListsOptions = {}) {
  const swrFallback: FeaturedListsResponse | undefined = fallbackData
    ? { items: fallbackData }
    : undefined;

  const { data, error, isLoading } = useSWR<FeaturedListsResponse>('/api/lists/featured', fetcher, {
    revalidateOnFocus: false,
    fallbackData: swrFallback,
  });

  return {
    items: data?.items ?? [],
    isLoading,
    error: error as Error | null,
  };
}
