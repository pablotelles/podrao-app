import type { ReviewScore } from '@/domain/entities/ReviewScore';

export interface SubmitReviewDTO {
  placeId: string;
  userId: string;
  rating: number; // 1-5
  scores?: ReviewScore[];
  photoUrls?: string[];
  comment?: string;
  amountPaidPerPerson?: number;
}
