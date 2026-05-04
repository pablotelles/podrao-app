import type { MealType } from '../value-objects/MealType';
import type { ReviewScore } from './ReviewScore';

export interface Review {
  id: string;
  placeId: string;
  userId: string;
  rating: number; // 1-5
  scores?: ReviewScore[];
  photos?: string[]; // URLs
  comment?: string;
  mealType?: MealType;
  amountPaidPerPerson?: number;
  createdAt: Date;
}
