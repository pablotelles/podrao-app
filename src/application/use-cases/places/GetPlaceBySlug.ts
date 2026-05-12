import type { Place } from '@/domain/entities/Place';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';

export class GetPlaceBySlug {
  constructor(private readonly repo: IPlaceRepository) {}

  async execute(slug: string): Promise<Place | null> {
    return this.repo.findBySlug(slug);
  }
}
