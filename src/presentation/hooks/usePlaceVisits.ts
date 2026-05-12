'use client';

import useSWR from 'swr';

interface PlaceVisitStatsResponse {
  distinctVisitors: number;
  viewerHasVisited: boolean;
  viewerVisitCount: number;
  viewerVisitedToday: boolean;
  viewerLastVisitedAt: string | null;
}

async function fetcher(url: string): Promise<PlaceVisitStatsResponse> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar visitas');
  return res.json() as Promise<PlaceVisitStatsResponse>;
}

export function usePlaceVisits(placeId: string) {
  const { data, isLoading, mutate } = useSWR<PlaceVisitStatsResponse>(
    `/api/places/${placeId}/visits`,
    fetcher,
    { revalidateOnFocus: false },
  );

  return {
    distinctVisitors: data?.distinctVisitors ?? 0,
    viewerHasVisited: data?.viewerHasVisited ?? false,
    viewerVisitCount: data?.viewerVisitCount ?? 0,
    viewerVisitedToday: data?.viewerVisitedToday ?? false,
    viewerLastVisitedAt: data?.viewerLastVisitedAt ?? null,
    isLoading,
    mutate,
  };
}
