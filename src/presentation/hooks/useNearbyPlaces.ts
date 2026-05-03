'use client';

import useSWR from 'swr';
import type { Place } from '@/domain/entities/Place';
import type { SearchPlacesDTO } from '@/application/dtos/SearchPlacesDTO';

function buildUrl(params: SearchPlacesDTO | null): string | null {
  if (!params?.lat || !params?.lng) return null;
  const q = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    ...(params.radiusMeters && { radius: String(params.radiusMeters) }),
    ...(params.mealType && { meal: params.mealType }),
    ...(params.cuisine && { cuisine: params.cuisine }),
    ...(params.maxPrice && { maxPrice: String(params.maxPrice) }),
    ...(params.limit && { limit: String(params.limit) }),
    ...(params.offset && { offset: String(params.offset) }),
  });
  return `/api/places?${q.toString()}`;
}

async function fetcher(url: string): Promise<Place[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar lugares');
  return res.json() as Promise<Place[]>;
}

export function useNearbyPlaces(params: SearchPlacesDTO | null) {
  const { data, error, isLoading, mutate } = useSWR<Place[]>(buildUrl(params), fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  return { places: data ?? [], error, isLoading, refresh: mutate };
}
