'use client';

import useSWRInfinite from 'swr/infinite';
import type { ListSummaryDTO, GetRecentListsResult } from '@/application/dtos/ListDTO';

interface UseRecentListsOptions {
  lat: number | null;
  lng: number | null;
  radiusKm?: number;
}

async function fetcher(url: string): Promise<GetRecentListsResult> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar listas recentes');
  return res.json() as Promise<GetRecentListsResult>;
}

function buildUrl(
  lat: number | null,
  lng: number | null,
  cursor: string | null | undefined,
  radiusKm?: number,
): string {
  const params = new URLSearchParams();
  if (lat !== null) params.set('lat', String(lat));
  if (lng !== null) params.set('lng', String(lng));
  if (radiusKm) params.set('radius_km', String(radiusKm));
  if (cursor) params.set('cursor', cursor);
  return `/api/lists/recent?${params.toString()}`;
}

export function useRecentLists({ lat, lng, radiusKm }: UseRecentListsOptions) {
  const { data, error, isLoading, isValidating, size, setSize } =
    useSWRInfinite<GetRecentListsResult>(
      (pageIndex, previousPageData: GetRecentListsResult | null) => {
        if (previousPageData && previousPageData.nextCursor === null) return null;
        const cursor = previousPageData?.nextCursor ?? null;
        return buildUrl(lat, lng, cursor, radiusKm);
      },
      fetcher,
      { revalidateOnFocus: true },
    );

  const items: ListSummaryDTO[] = data ? data.flatMap((page) => page.items) : [];
  const lastPage = data?.[data.length - 1];
  const hasMore = lastPage ? lastPage.nextCursor !== null : false;
  const isLoadingMore = isValidating && size > 1;

  function loadMore() {
    if (hasMore && !isValidating) {
      void setSize(size + 1);
    }
  }

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error: error as Error | null,
  };
}
