import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { IReviewRepository } from '@/domain/interfaces/IReviewRepository';
import type { IFavoriteRepository } from '@/domain/interfaces/IFavoriteRepository';
import type { UserStatsDTO } from '@/application/dtos/UserStatsDTO';

export interface UserStats {
  placesCount: number;
  reviewsCount: number;
  favoritesCount: number;
}

export class GetUserStats {
  constructor(
    private placeRepo: IPlaceRepository,
    private reviewRepo: IReviewRepository,
    private favoriteRepo: IFavoriteRepository,
  ) {}

  async execute(dto: UserStatsDTO): Promise<UserStats> {
    const [placesCount, reviewsCount, favoritesCount] = await Promise.all([
      this.placeRepo.countByCreator(dto.userId),
      this.reviewRepo.countByUser(dto.userId),
      this.favoriteRepo.countByUser(dto.userId),
    ]);

    return { placesCount, reviewsCount, favoritesCount };
  }
}
