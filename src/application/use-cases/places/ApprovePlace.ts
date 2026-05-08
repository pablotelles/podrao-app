import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { ICacheProvider } from '@/domain/interfaces/ICacheProvider';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { ConflictError } from '@/application/errors/ConflictError';

export class ApprovePlace {
  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly cache: ICacheProvider,
  ) {}

  async execute(id: string): Promise<void> {
    const place = await this.placeRepo.findById(id);
    if (!place) throw new PlaceNotFoundError(id);

    if (place.status !== 'pending') throw new ConflictError('Lugar já foi processado');

    await this.placeRepo.updateStatus(id, 'approved');

    const lat = Math.round(place.lat * 1000) / 1000;
    const lng = Math.round(place.lng * 1000) / 1000;
    await this.cache.deletePattern(`places:${lat}:${lng}:*`);
  }
}
