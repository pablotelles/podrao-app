import type { Favorite } from '@/domain/entities/Favorite';
import type { IFavoriteRepository } from '@/domain/interfaces/IFavoriteRepository';
import type { GetUserFavoritesDTO } from '@/application/dtos/FavoriteDTO';

export class GetUserFavorites {
  constructor(private readonly favoriteRepo: IFavoriteRepository) {}

  async execute(dto: GetUserFavoritesDTO): Promise<Favorite[]> {
    return this.favoriteRepo.getFavoritesByUser(dto.userId);
  }
}
