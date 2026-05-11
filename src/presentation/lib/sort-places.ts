import type { Place } from '@/domain/entities/Place';

export type SortOption = 'custom' | 'nearest' | 'cheapest' | 'top_rated' | 'newest' | 'az';

export const SORT_LABELS: Record<SortOption, string> = {
  custom: 'Personalizado',
  nearest: 'Mais próximos',
  cheapest: 'Mais baratos',
  top_rated: 'Mais bem avaliados',
  newest: 'Mais recentes',
  az: 'A–Z',
};

const PRICE_BUCKET_ORDER: Record<string, number> = {
  up_to_15: 0,
  '15_25': 1,
  '25_40': 2,
  '40_70': 3,
  '70_plus': 4,
};

export function sortPlaces(places: Place[], option: SortOption): Place[] {
  if (option === 'custom') return places;

  return [...places].sort((a, b) => {
    switch (option) {
      case 'nearest': {
        const da = a.distanceM ?? Infinity;
        const db = b.distanceM ?? Infinity;
        return da - db;
      }
      case 'cheapest': {
        const pa = PRICE_BUCKET_ORDER[a.priceBucket] ?? Infinity;
        const pb = PRICE_BUCKET_ORDER[b.priceBucket] ?? Infinity;
        return pa - pb;
      }
      case 'top_rated':
        return (b.rating ?? 0) - (a.rating ?? 0);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'az':
        return a.name.localeCompare(b.name, 'pt-BR');
    }
  });
}
