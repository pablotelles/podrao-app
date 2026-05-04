import type { ReviewCategory } from '../value-objects/ReviewCategory';

export interface ReviewScore {
  category: ReviewCategory;
  score: number; // 1-5
}
