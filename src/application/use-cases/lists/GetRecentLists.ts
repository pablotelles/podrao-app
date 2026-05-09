import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { GetRecentListsDTO, GetRecentListsResult } from '@/application/dtos/ListDTO';
import { toSummary } from './listMappers';

const DEFAULT_RADIUS_KM = 10;
const DEFAULT_LIMIT = 20;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export class GetRecentLists {
  constructor(private readonly repo: IListRepository) {}

  async execute(dto: GetRecentListsDTO = {}): Promise<GetRecentListsResult> {
    const limit = dto.limit ?? DEFAULT_LIMIT;
    const radiusM = (dto.radiusKm ?? DEFAULT_RADIUS_KM) * 1000;
    const since = new Date(Date.now() - THIRTY_DAYS_MS);
    const cursor = dto.cursor ? new Date(dto.cursor) : undefined;

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
