import type { Place } from '@/domain/entities/Place';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';

export class GetPlaceById {
  constructor(private readonly placeRepo: IPlaceRepository) {}

  async execute(id: string): Promise<Place> {
    const place = await this.placeRepo.findById(id);
    if (!place) throw new PlaceNotFoundError(id);
    return place;
  }
}
