'use client';

import { useListActions } from '@/presentation/hooks/useListActions';
import { ListStatsBar } from './ListStatsBar';

interface ListStatsBarWrapperProps {
  listId: string;
  placesCount: number;
  viewCount: number;
  initialSavesCount: number;
  initialSaved: boolean;
  recommendPercent?: number;
  priceBucket?: string;
}

export function ListStatsBarWrapper({
  listId,
  placesCount,
  viewCount,
  initialSavesCount,
  initialSaved,
  recommendPercent,
  priceBucket,
}: ListStatsBarWrapperProps) {
  const { savesCount } = useListActions({
    listId,
    initialFavorited: false,
    initialSaved,
    initialFavoritesCount: 0,
    initialSavesCount,
  });

  return (
    <ListStatsBar
      placesCount={placesCount}
      savesCount={savesCount}
      viewCount={viewCount}
      recommendPercent={recommendPercent}
      priceBucket={priceBucket}
    />
  );
}
