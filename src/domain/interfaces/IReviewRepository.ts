import type { Review } from '../entities/Review';
import type { ReviewScore } from '../entities/ReviewScore';
import type { PriceBucket } from '../value-objects/PriceBucket';

export interface CreateReviewData {
  placeId: string;
  userId: string;
  rating: number; // 1-5
  scores?: ReviewScore[];
  photoUrls?: string[];
  comment?: string;
  priceBucket?: PriceBucket;
  visitId?: string; // optional link to the check-in that unlocked this review
}

export type UpdateReviewData = Partial<
  Pick<CreateReviewData, 'rating' | 'scores' | 'photoUrls' | 'comment' | 'priceBucket'>
>;

export interface IReviewRepository {
  findByPlace(placeId: string, viewerUserId?: string): Promise<Review[]>;
  findByUser(userId: string): Promise<Review[]>;
  findById(reviewId: string): Promise<Review | null>;
  create(data: CreateReviewData): Promise<Review>;
  update(reviewId: string, data: UpdateReviewData): Promise<Review>;
  delete(reviewId: string): Promise<void>;
  existsForUser(placeId: string, userId: string): Promise<boolean>;
  countByUser(userId: string): Promise<number>;
  countByUserForPlace(placeId: string, userId: string): Promise<number>;
}
