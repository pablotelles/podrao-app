import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { Place } from '@/domain/entities/Place';

export interface GetPendingPlacesDTO {
  limit: number;
  offset: number;
}

export interface GetPendingPlacesResult {
  places: Place[];
  total: number;
}

export class GetPendingPlaces {
  constructor(private readonly placeRepo: IPlaceRepository) {}

  async execute(dto: GetPendingPlacesDTO): Promise<GetPendingPlacesResult> {
    return this.placeRepo.getPendingPlaces(dto.limit, dto.offset);
  }
}
