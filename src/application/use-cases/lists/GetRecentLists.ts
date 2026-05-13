import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { ICacheProvider } from '@/domain/interfaces/ICacheProvider';
import type { GetRecentListsDTO, GetRecentListsResult } from '@/application/dtos/ListDTO';
import { toSummary } from './listMappers';

const DEFAULT_RADIUS_KM = 10;
const DEFAULT_LIMIT = 20;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export class GetRecentLists {
  constructor(
    private readonly repo: IListRepository,
    private readonly cache?: ICacheProvider,
  ) {}

  async execute(dto: GetRecentListsDTO = {}): Promise<GetRecentListsResult> {
    const limit = dto.limit ?? DEFAULT_LIMIT;
    const radiusKm = dto.radiusKm ?? DEFAULT_RADIUS_KM;
    const radiusM = radiusKm * 1000;
    const since = new Date(Date.now() - THIRTY_DAYS_MS);
    const cursor = dto.cursor ? new Date(dto.cursor) : undefined;

    // Cache only for the first page (no cursor) when lat/lng are provided
    const shouldCache = !cursor && this.cache;
    if (shouldCache) {
      const lat3 = dto.lat !== undefined ? Math.round(dto.lat * 1000) / 1000 : 'x';
      const lng3 = dto.lng !== undefined ? Math.round(dto.lng * 1000) / 1000 : 'x';
      const radiusRounded = Math.round(radiusKm);
      const key = `recent-lists:${lat3}:${lng3}:${radiusRounded}:${limit}`;

      const cached = await this.cache.get<GetRecentListsResult>(key);
      if (cached) return cached;

      const { lists, nextCursor } = await this.repo.findRecentNearby({
        lat: dto.lat,
        lng: dto.lng,
        radiusM,
        since,
        cursor,
        limit,
      });

      const result: GetRecentListsResult = {
        items: lists.map(toSummary),
        nextCursor: nextCursor ? nextCursor.toISOString() : null,
      };

      await this.cache.set(key, result, { ttl: 120 });
      return result;
    }

    const { lists, nextCursor } = await this.repo.findRecentNearby({
      lat: dto.lat,
      lng: dto.lng,
      radiusM,
      since,
      cursor,
      limit,
    });

    return {
      items: lists.map(toSummary),
      nextCursor: nextCursor ? nextCursor.toISOString() : null,
    };
  }
}
