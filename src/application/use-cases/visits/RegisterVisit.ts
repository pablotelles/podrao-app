import type { PlaceVisit } from '@/domain/entities/PlaceVisit';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { IPlaceVisitRepository } from '@/domain/interfaces/IPlaceVisitRepository';
import type { RegisterVisitDTO } from '@/application/dtos/RegisterVisitDTO';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { ValidationError } from '@/application/errors/ValidationError';

export class RegisterVisit {
  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly visitRepo: IPlaceVisitRepository,
  ) {}

  async execute(dto: RegisterVisitDTO): Promise<PlaceVisit> {
    const place = await this.placeRepo.findById(dto.placeId);
    if (!place) throw new PlaceNotFoundError(dto.placeId);
    if (place.status !== 'approved') {
      throw new ValidationError('Só é possível fazer check-in em lugares aprovados');
    }

    return this.visitRepo.create({
      placeId: dto.placeId,
      userId: dto.userId,
      recency: dto.recency,
    });
  }
}
