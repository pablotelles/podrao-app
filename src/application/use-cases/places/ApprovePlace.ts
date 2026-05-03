import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { ICacheProvider } from '@/domain/interfaces/ICacheProvider';
import type { PlaceStatus } from '@/domain/entities/Place';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';

export class ApprovePlace {
  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly cache: ICacheProvider,
  ) {}

  async execute(id: string, status: Extract<PlaceStatus, 'approved' | 'rejected'>): Promise<void> {
    const place = await this.placeRepo.findById(id);
    if (!place) throw new PlaceNotFoundError(id);

    await this.placeRepo.updateStatus(id, status);

    if (status === 'approved') {
      const lat = Math.round(place.lat * 1000) / 1000;
      const lng = Math.round(place.lng * 1000) / 1000;
      await this.cache.deletePattern(`places:${lat}:${lng}:*`);
    }
  }
}
