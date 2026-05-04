'use client';

import { useListActions } from '@/presentation/hooks/useListActions';
import { ListActionBar } from './ListActionBar';

interface ListActionBarWrapperProps {
  listId: string;
  placesCount: number;
  viewCount: number;
  initialFavoritesCount: number;
  initialSavesCount: number;
  initialFavorited: boolean;
  initialSaved: boolean;
  isLoggedIn: boolean;
}

export function ListActionBarWrapper({
  listId,
  placesCount,
  viewCount,
  initialFavoritesCount,
  initialSavesCount,
  initialFavorited,
  initialSaved,
  isLoggedIn,
}: ListActionBarWrapperProps) {
  const { isFavorited, isSaved, favoritesCount, savesCount, toggleFavorite, toggleSave } =
    useListActions({
      listId,
      initialFavorited,
      initialSaved,
      initialFavoritesCount,
      initialSavesCount,
    });

  return (
    <ListActionBar
      placesCount={placesCount}
      favoritesCount={favoritesCount}
      viewCount={viewCount}
      savesCount={savesCount}
      isFavorited={isFavorited}
      isSaved={isSaved}
      onToggleFavorite={toggleFavorite}
      onToggleSave={toggleSave}
      isLoggedIn={isLoggedIn}
    />
  );
}
