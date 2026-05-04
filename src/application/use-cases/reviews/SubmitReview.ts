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
    // Validate rating
    if (dto.rating < 1 || dto.rating > 5) {
      throw new ValidationError('Nota deve estar entre 1 e 5');
    }

    // Validate amount paid per person
    if (dto.amountPaidPerPerson !== undefined) {
      if (dto.amountPaidPerPerson <= 0 || dto.amountPaidPerPerson >= 2000) {
        throw new ValidationError('Valor por pessoa deve estar entre R$0,01 e R$1.999,99');
      }
    }

    // Validate comment length
    if (dto.comment && dto.comment.length > 500) {
      throw new ValidationError('Comentário não pode ter mais de 500 caracteres');
    }

    // Validate category scores if provided
    if (dto.scores) {
      for (const score of dto.scores) {
        if (score.score < 1 || score.score > 5) {
          throw new ValidationError('Notas por categoria devem estar entre 1 e 5');
        }
      }
    }

    // Validate photo URLs count
    if (dto.photoUrls && dto.photoUrls.length > 5) {
      throw new ValidationError('Máximo de 5 fotos por avaliação');
    }

    // Check if place exists
    const place = await this.placeRepo.findById(dto.placeId);
    if (!place) throw new PlaceNotFoundError(dto.placeId);

    // Check if user already reviewed this place
    const already = await this.reviewRepo.existsForUser(dto.placeId, dto.userId);
    if (already) throw new ConflictError('Você já avaliou este lugar');

    // Create review with all new fields
    return this.reviewRepo.create({
      placeId: dto.placeId,
      userId: dto.userId,
      rating: dto.rating,
      scores: dto.scores,
      photoUrls: dto.photoUrls,
      comment: dto.comment,
      mealType: dto.mealType,
      amountPaidPerPerson: dto.amountPaidPerPerson,
    });
  }
}
