import { getFeaturedLists, cacheProvider } from '@/presentation/lib/container';
import type { ListSummaryDTO } from '@/application/dtos/ListDTO';

const CACHE_KEY = 'lists:featured';
const CACHE_TTL = 3600;
export const FEATURED_LISTS_LIMIT = 4;

export async function getFeaturedListsCached(limit: number): Promise<ListSummaryDTO[]> {
  const cached = await cacheProvider.get<ListSummaryDTO[]>(CACHE_KEY);
  if (cached) {
    return cached;
  }

  const items = await getFeaturedLists.execute({ limit });

  await cacheProvider.set(CACHE_KEY, items, { ttl: CACHE_TTL });

  return items;
}
