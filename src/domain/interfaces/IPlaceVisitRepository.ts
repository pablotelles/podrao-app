import type { PlaceVisit } from '../entities/PlaceVisit';
import type { VisitRecency } from '../value-objects/VisitRecency';

export interface CreateVisitData {
  placeId: string;
  userId: string;
  recency: VisitRecency;
}

export interface IPlaceVisitRepository {
  create(data: CreateVisitData): Promise<PlaceVisit>;
  countDistinctVisitorsForPlace(placeId: string): Promise<number>;
  hasUserVisited(placeId: string, userId: string): Promise<boolean>;
  countByUserForPlace(placeId: string, userId: string): Promise<number>;
  getLastVisitForUser(placeId: string, userId: string): Promise<PlaceVisit | null>;
}
