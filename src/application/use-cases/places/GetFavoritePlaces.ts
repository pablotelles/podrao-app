import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { Place } from '@/domain/entities/Place';

export interface GetFavoritePlacesDTO {
  userId: string;
}

export class GetFavoritePlaces {
  constructor(private readonly repo: IPlaceRepository) {}

  async execute(dto: GetFavoritePlacesDTO): Promise<Place[]> {
    return this.repo.findFavoritedByUser(dto.userId);
  }
}
