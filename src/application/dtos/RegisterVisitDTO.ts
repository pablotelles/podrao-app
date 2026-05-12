import type { VisitRecency } from '@/domain/value-objects/VisitRecency';

export interface RegisterVisitDTO {
  placeId: string;
  userId: string;
  recency: VisitRecency;
}
