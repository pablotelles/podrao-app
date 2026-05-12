import type {
  PlaceEdit,
  PlaceEditStatus,
  EditResolvedBy,
  PlaceEditWithVotes,
} from '../entities/PlaceEdit';

export interface CreatePlaceEditData {
  placeId: string;
  fieldName: string;
  oldValue: unknown;
  newValue: unknown;
  level: 1 | 2;
  userId: string;
  note?: string;
}

export interface IPlaceEditRepository {
  create(data: CreatePlaceEditData): Promise<PlaceEdit>;
  findById(id: string): Promise<PlaceEdit | null>;
  findPendingByPlaceAndField(placeId: string, fieldName: string): Promise<PlaceEdit | null>;
  findWithVoteCounts(id: string, viewerUserId?: string): Promise<PlaceEditWithVotes | null>;
  listWithVoteCounts(placeId: string, viewerUserId?: string): Promise<PlaceEditWithVotes[]>;
  listPendingByLevel(level: 1 | 2): Promise<PlaceEditWithVotes[]>;
  listExpired(): Promise<PlaceEditWithVotes[]>;
  listPendingOlderThan(cutoff: { level1: Date; level2: Date }): Promise<PlaceEdit[]>;
  countByUserSince(userId: string, since: Date): Promise<number>;
  updateStatus(
    id: string,
    status: PlaceEditStatus,
    resolvedBy: EditResolvedBy,
    resolvedAt: Date,
  ): Promise<void>;
}
