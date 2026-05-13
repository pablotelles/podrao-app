import type { Place } from '@/domain/entities/Place';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { ICacheProvider } from '@/domain/interfaces/ICacheProvider';

export class GetPlaceBySlug {
  constructor(
    private readonly repo: IPlaceRepository,
    private readonly cache: ICacheProvider,
  ) {}

  async execute(slug: string): Promise<Place | null> {
    const key = `place:slug:${slug}`;

    const cached = await this.cache.get<Place>(key);
    if (cached) return cached;

    const place = await this.repo.findBySlug(slug);
    if (place) {
      await this.cache.set(key, place, { ttl: 300 });
    }
    return place;
  }
}
