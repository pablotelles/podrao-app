import { z } from 'zod';
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
  amountPaidPerPerson: z.number().positive().max(1999).optional(),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
