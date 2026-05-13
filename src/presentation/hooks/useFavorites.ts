'use client';

import { useRouter } from 'next/navigation';
import useSWR, { mutate as globalMutate } from 'swr';
import type { Favorite } from '@/domain/entities/Favorite';
import { useUser } from '@/presentation/contexts/UserContext';

async function fetcher(url: string): Promise<Favorite[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar favoritos');
  return res.json() as Promise<Favorite[]>;
}

export function useFavorites() {
  const { user } = useUser();
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR<Favorite[]>(
    user ? '/api/favorites' : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  const toggle = async (placeId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Optimistic update
    const currentFavorites = data ?? [];
    const isFavorited = currentFavorites.some((f) => f.placeId === placeId);

    // Update UI imediatamente
    if (isFavorited) {
      mutate(
        currentFavorites.filter((f) => f.placeId !== placeId),
        false,
      );
    } else {
      mutate(
        [...currentFavorites, { placeId, userId: '', createdAt: new Date() } as Favorite],
        false,
      );
    }

    try {
      const res = await fetch(`/api/favorites/${placeId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao atualizar favorito');

      // Revalidar para garantir consistência
      mutate();
      // Revalidar lista de places favoritos e stats
      globalMutate('/api/me/favorites');
      globalMutate('/api/me/stats');
    } catch (err) {
      // Rollback em caso de erro
      mutate(currentFavorites, false);
      throw err;
    }
  };

  const isFavorited = (placeId: string) => {
    return data?.some((f) => f.placeId === placeId) ?? false;
  };

  return {
    favorites: data ?? [],
    toggle,
    isFavorited,
    isLoading,
    error,
  };
}
