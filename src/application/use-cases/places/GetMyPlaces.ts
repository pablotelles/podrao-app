import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { Place } from '@/domain/entities/Place';

export interface GetMyPlacesDTO {
  userId: string;
}

export class GetMyPlaces {
  constructor(private readonly repo: IPlaceRepository) {}

  async execute(dto: GetMyPlacesDTO): Promise<Place[]> {
    return this.repo.findByCreator(dto.userId);
  }
}
