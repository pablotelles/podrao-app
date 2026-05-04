import type { IFavoriteRepository } from '@/domain/interfaces/IFavoriteRepository';
import type { ToggleFavoriteDTO } from '@/application/dtos/FavoriteDTO';

export interface ToggleFavoriteResult {
  favorited: boolean;
}

export class ToggleFavorite {
  constructor(private readonly favoriteRepo: IFavoriteRepository) {}

  async execute(dto: ToggleFavoriteDTO): Promise<ToggleFavoriteResult> {
    const isFavorited = await this.favoriteRepo.isFavorited(dto.userId, dto.placeId);

    if (isFavorited) {
      await this.favoriteRepo.remove(dto.userId, dto.placeId);
      return { favorited: false };
    } else {
      await this.favoriteRepo.add(dto.userId, dto.placeId);
      return { favorited: true };
    }
  }
}
