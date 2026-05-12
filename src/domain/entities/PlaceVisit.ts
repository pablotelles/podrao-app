import type { VisitRecency } from '../value-objects/VisitRecency';

export interface PlaceVisit {
  id: string;
  placeId: string;
  userId: string;
  recency: VisitRecency;
  visitedAt: Date;
}
