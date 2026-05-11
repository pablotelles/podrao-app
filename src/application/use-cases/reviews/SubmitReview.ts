import type { Review } from '@/domain/entities/Review';
import type { IReviewRepository } from '@/domain/interfaces/IReviewRepository';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { SubmitReviewDTO } from '@/application/dtos/SubmitReviewDTO';
import { PRICE_BUCKETS } from '@/domain/value-objects/PriceBucket';
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

    // Validate price bucket if provided
    if (dto.priceBucket !== undefined && !PRICE_BUCKETS.includes(dto.priceBucket)) {
      throw new ValidationError('Faixa de preço inválida');
    }

    // Validate comment length
    if (dto.comment && dto.comment.length > 1500) {
      throw new ValidationError('Comentário não pode ter mais de 1.500 caracteres');
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

    // Create review with all fields
    return this.reviewRepo.create({
      placeId: dto.placeId,
      userId: dto.userId,
      rating: dto.rating,
      scores: dto.scores,
      photoUrls: dto.photoUrls,
      comment: dto.comment,
      priceBucket: dto.priceBucket,
    });
  }
}
