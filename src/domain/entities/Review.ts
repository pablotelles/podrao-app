import type { MealType } from '../value-objects/MealType';

export interface Review {
  id: string;
  placeId: string;
  userId: string;
  thumbsUp: boolean;
  amountPaid?: number;
  mealType?: MealType;
  comment?: string;
  createdAt: Date;
}
