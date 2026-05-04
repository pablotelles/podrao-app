'use client';

import { useState, useCallback } from 'react';

interface UseListActionsOptions {
  listId: string;
  initialFavorited: boolean;
  initialSaved: boolean;
  initialFavoritesCount: number;
  initialSavesCount: number;
}

export function useListActions({
  listId,
  initialFavorited,
  initialSaved,
  initialFavoritesCount,
  initialSavesCount,
}: UseListActionsOptions) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [favoritesCount, setFavoritesCount] = useState(initialFavoritesCount);
  const [savesCount, setSavesCount] = useState(initialSavesCount);

  const toggleFavorite = useCallback(async () => {
    // Optimistic update
    const next = !isFavorited;
    setIsFavorited(next);
    setFavoritesCount((c) => c + (next ? 1 : -1));

    try {
      const res = await fetch(`/api/lists/${listId}/favorite`, { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao favoritar lista');
      const data = (await res.json()) as { favorited: boolean };
      setIsFavorited(data.favorited);
    } catch {
      // Rollback
      setIsFavorited(isFavorited);
      setFavoritesCount((c) => c + (isFavorited ? 1 : -1));
    }
  }, [listId, isFavorited]);

  const toggleSave = useCallback(async () => {
    // Optimistic update
    const next = !isSaved;
    setIsSaved(next);
    setSavesCount((c) => c + (next ? 1 : -1));

    try {
      const res = await fetch(`/api/lists/${listId}/save`, { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao salvar lista');
      const data = (await res.json()) as { saved: boolean };
      setIsSaved(data.saved);
    } catch {
      // Rollback
      setIsSaved(isSaved);
      setSavesCount((c) => c + (isSaved ? 1 : -1));
    }
  }, [listId, isSaved]);

  return {
    isFavorited,
    isSaved,
    favoritesCount,
    savesCount,
    toggleFavorite,
    toggleSave,
  };
}
