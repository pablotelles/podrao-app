import type { Review } from '@/domain/entities/Review';
import type { IReviewRepository } from '@/domain/interfaces/IReviewRepository';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { SubmitReviewDTO } from '@/application/dtos/SubmitReviewDTO';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { ConflictError } from '@/application/errors/ConflictError';
import { ValidationError } from '@/application/errors/ValidationError';

export class SubmitReview {
  constructor(
    private readonly reviewRepo: IReviewRepository,
    private readonly placeRepo: IPlaceRepository,
  ) {}

  async execute(dto: SubmitReviewDTO): Promise<Review> {
    if (dto.amountPaid !== undefined && dto.amountPaid < 0) {
      throw new ValidationError('Valor pago não pode ser negativo');
    }

    const place = await this.placeRepo.findById(dto.placeId);
    if (!place) throw new PlaceNotFoundError(dto.placeId);

    const already = await this.reviewRepo.existsForUser(dto.placeId, dto.userId);
    if (already) throw new ConflictError('Você já avaliou este lugar');

    return this.reviewRepo.create({
      placeId: dto.placeId,
      userId: dto.userId,
      thumbsUp: dto.thumbsUp,
      amountPaid: dto.amountPaid,
      mealType: dto.mealType,
      comment: dto.comment,
    });
  }
}
