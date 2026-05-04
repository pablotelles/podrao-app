import useSWR from 'swr';

interface UserStats {
  placesCount: number;
  reviewsCount: number;
  favoritesCount: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useUserStats() {
  const { data, error, isLoading, mutate } = useSWR<UserStats>('/api/me/stats', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000, // 5min
  });

  return {
    stats: data,
    isLoading,
    error,
    mutate,
  };
}
