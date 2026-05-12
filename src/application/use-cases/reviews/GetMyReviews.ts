import type { IReviewRepository } from '@/domain/interfaces/IReviewRepository';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';

export interface GetMyReviewsDTO {
  userId: string;
  limit?: number;
}

export interface MyReviewItem {
  id: string;
  placeId: string;
  placeSlug?: string | null;
  placeName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export class GetMyReviews {
  constructor(
    private readonly reviewRepo: IReviewRepository,
    private readonly placeRepo: IPlaceRepository,
  ) {}

  async execute(dto: GetMyReviewsDTO): Promise<MyReviewItem[]> {
    const { userId, limit = 5 } = dto;

    const reviews = await this.reviewRepo.findByUser(userId);

    const sorted = reviews
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return Promise.all(
      sorted.map(async (review) => {
        const place = await this.placeRepo.findById(review.placeId);
        return {
          id: review.id,
          placeId: review.placeId,
          placeSlug: place?.slug,
          placeName: place?.name ?? 'Lugar desconhecido',
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt.toISOString(),
        };
      }),
    );
  }
}
