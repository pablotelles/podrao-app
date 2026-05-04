import type { Review } from '../entities/Review';
import type { MealType } from '../value-objects/MealType';

export interface CreateReviewData {
  placeId: string;
  userId: string;
  thumbsUp: boolean;
  amountPaid?: number;
  mealType?: MealType;
  comment?: string;
}

export interface IReviewRepository {
  findByPlace(placeId: string): Promise<Review[]>;
  findByUser(userId: string): Promise<Review[]>;
  create(data: CreateReviewData): Promise<Review>;
  existsForUser(placeId: string, userId: string): Promise<boolean>;
  countByUser(userId: string): Promise<number>;
}
