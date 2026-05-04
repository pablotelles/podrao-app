import type { Review } from '../entities/Review';
import type { MealType } from '../value-objects/MealType';
import type { ReviewScore } from '../entities/ReviewScore';

export interface CreateReviewData {
  placeId: string;
  userId: string;
  rating: number; // 1-5
  scores?: ReviewScore[];
  photoUrls?: string[];
  comment?: string;
  mealType?: MealType;
  amountPaidPerPerson?: number;
}

export interface IReviewRepository {
  findByPlace(placeId: string): Promise<Review[]>;
  findByUser(userId: string): Promise<Review[]>;
  create(data: CreateReviewData): Promise<Review>;
  existsForUser(placeId: string, userId: string): Promise<boolean>;
  countByUser(userId: string): Promise<number>;
}
