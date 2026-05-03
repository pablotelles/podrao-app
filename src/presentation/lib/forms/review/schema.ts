import { z } from 'zod';
import { MEAL_TYPES } from '@/domain/value-objects/MealType';

export const submitReviewSchema = z.object({
  thumbsUp: z.boolean(),
  amountPaid: z.number().nonnegative().optional(),
  mealType: z.enum(MEAL_TYPES).optional(),
  comment: z.string().max(500).optional(),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
