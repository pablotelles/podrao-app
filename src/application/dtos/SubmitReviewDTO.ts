import type { ReviewScore } from '@/domain/entities/ReviewScore';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';

export interface SubmitReviewDTO {
  placeId: string;
  userId: string;
  rating: number; // 1-5
  scores?: ReviewScore[];
  photoUrls?: string[];
  comment?: string;
  priceBucket?: PriceBucket;
  visitId?: string;
}
