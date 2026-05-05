'use client';

import { useCallback } from 'react';
import { useListActions } from '@/presentation/hooks/useListActions';
import { ListActionBar } from './ListActionBar';

interface ListActionBarWrapperProps {
  listId: string;
  placesCount: number;
  viewCount: number;
  initialSavesCount: number;
  initialSaved: boolean;
  isLoggedIn: boolean;
}

export function ListActionBarWrapper({
  listId,
  placesCount,
  viewCount,
  initialSavesCount,
  initialSaved,
  isLoggedIn,
}: ListActionBarWrapperProps) {
  const { isSaved, savesCount, toggleSave } = useListActions({
    listId,
    initialFavorited: false,
    initialSaved,
    initialFavoritesCount: 0,
    initialSavesCount,
  });

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        // usuário cancelou ou API não suportada
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, []);

  return (
    <ListActionBar
      placesCount={placesCount}
      viewCount={viewCount}
      savesCount={savesCount}
      isSaved={isSaved}
      onToggleSave={toggleSave}
      onShare={handleShare}
      isLoggedIn={isLoggedIn}
    />
  );
}
