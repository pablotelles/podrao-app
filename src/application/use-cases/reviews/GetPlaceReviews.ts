import type { Review } from '@/domain/entities/Review';
import type { IReviewRepository } from '@/domain/interfaces/IReviewRepository';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { ICacheProvider } from '@/domain/interfaces/ICacheProvider';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';

export class GetPlaceReviews {
  constructor(
    private readonly reviewRepo: IReviewRepository,
    private readonly placeRepo: IPlaceRepository,
    private readonly cache?: ICacheProvider,
  ) {}

  async execute(placeId: string, viewerUserId?: string): Promise<Review[]> {
    const place = await this.placeRepo.findById(placeId);
    if (!place) throw new PlaceNotFoundError(placeId);

    // Cache only for anonymous calls — viewerReactionType is per-viewer and cannot be shared
    if (!viewerUserId && this.cache) {
      const key = `reviews:place:${placeId}`;
      const cached = await this.cache.get<Review[]>(key);
      if (cached) return cached;

      const reviews = await this.reviewRepo.findByPlace(placeId, undefined);
      await this.cache.set(key, reviews, { ttl: 60 });
      return reviews;
    }

    return this.reviewRepo.findByPlace(placeId, viewerUserId);
  }
}
