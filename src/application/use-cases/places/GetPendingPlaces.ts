import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { PendingPlaceItem } from '@/domain/entities/PendingPlaceItem';

export interface GetPendingPlacesDTO {
  limit: number;
  offset: number;
}

export interface GetPendingPlacesResult {
  places: PendingPlaceItem[];
  total: number;
}

export class GetPendingPlaces {
  constructor(private readonly placeRepo: IPlaceRepository) {}

  async execute(dto: GetPendingPlacesDTO): Promise<GetPendingPlacesResult> {
    return this.placeRepo.getPendingPlaces(dto.limit, dto.offset);
  }
}
