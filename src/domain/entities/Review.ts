import type { ReviewScore } from './ReviewScore';
import type { PriceBucket } from '../value-objects/PriceBucket';

export interface Review {
  id: string;
  placeId: string;
  userId: string;
  rating: number; // 1-5
  scores?: ReviewScore[];
  photos?: string[]; // URLs
  comment?: string;
  priceBucket?: PriceBucket;
  visitId?: string; // link to place_visits row that unlocked this review, if any
  createdAt: Date;
  // Populated via JOIN with profiles when fetching for display
  authorNickname?: string;
  authorAvatarUrl?: string;
  // Populated via batch reaction queries when fetching for display
  // { useful: 5, partial: 1, not_useful: 2 }
  reactionCounts?: Record<string, number>;
  // Qual tipo o viewer reagiu ('useful' | 'partial' | 'not_useful' | null)
  viewerReactionType?: string | null;
}
