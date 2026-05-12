'use client';

import useSWR from 'swr';

export interface MyReview {
  id: string;
  placeId: string;
  placeSlug?: string | null;
  placeName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

async function fetcher(url: string): Promise<MyReview[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar avaliações');
  return res.json() as Promise<MyReview[]>;
}

export function useMyReviews() {
  const { data, error, isLoading, mutate } = useSWR<MyReview[]>('/api/me/reviews', fetcher, {
    revalidateOnFocus: false,
  });

  return {
    reviews: data ?? [],
    error: error as Error | null,
    isLoading,
    mutate,
  };
}
