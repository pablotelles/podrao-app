import type { SubmitReviewInput } from './schema';

export const submitReviewInitialValues: Partial<SubmitReviewInput> = {
  rating: undefined,
  scores: undefined,
  photoUrls: undefined,
  comment: undefined,
  mealType: undefined,
  amountPaidPerPerson: undefined,
};
