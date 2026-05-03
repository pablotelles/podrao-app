import type { Review } from '@/domain/entities/Review';
import type { IReviewRepository } from '@/domain/interfaces/IReviewRepository';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';

export class GetPlaceReviews {
  constructor(
    private readonly reviewRepo: IReviewRepository,
    private readonly placeRepo: IPlaceRepository,
  ) {}

  async execute(placeId: string): Promise<Review[]> {
    const place = await this.placeRepo.findById(placeId);
    if (!place) throw new PlaceNotFoundError(placeId);
    return this.reviewRepo.findByPlace(placeId);
  }
}
