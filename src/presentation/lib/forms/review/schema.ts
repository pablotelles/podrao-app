import { z } from 'zod';
import { MEAL_TYPES } from '@/domain/value-objects/MealType';
import { REVIEW_CATEGORIES } from '@/domain/value-objects/ReviewCategory';

export const submitReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  scores: z
    .array(
      z.object({
        category: z.enum(REVIEW_CATEGORIES),
        score: z.number().int().min(1).max(5),
      }),
    )
    .max(5)
    .optional(),
  photoUrls: z.array(z.string().url()).max(5).optional(),
  comment: z.string().max(500).optional(),
  mealType: z.enum(MEAL_TYPES).optional(),
  amountPaidPerPerson: z.number().positive().max(1999).optional(),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
