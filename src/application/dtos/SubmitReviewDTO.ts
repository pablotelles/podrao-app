import type { MealType } from '@/domain/value-objects/MealType';

export interface SubmitReviewDTO {
  placeId: string;
  userId: string;
  thumbsUp: boolean;
  amountPaid?: number;
  mealType?: MealType;
  comment?: string;
}
