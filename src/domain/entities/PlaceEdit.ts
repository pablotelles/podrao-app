export type PlaceEditStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type EditResolvedBy = 'community' | 'admin' | 'system';

export interface PlaceEdit {
  id: string;
  placeId: string;
  fieldName: string;
  oldValue: unknown;
  newValue: unknown;
  status: PlaceEditStatus;
  level: 1 | 2;
  userId: string;
  note?: string;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: EditResolvedBy;
}

export interface PlaceEditWithVotes extends PlaceEdit {
  confirmCount: number;
  contestCount: number;
  viewerVote?: 'confirm' | 'contest' | null;
}
