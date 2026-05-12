import type { PlaceEditWithVotes } from '@/domain/entities/PlaceEdit';
import type { IPlaceEditRepository } from '@/domain/interfaces/IPlaceEditRepository';

export interface ListPendingEditsForPlaceDTO {
  placeId: string;
  viewerUserId?: string;
}

export class ListPendingEditsForPlace {
  constructor(private readonly editRepo: IPlaceEditRepository) {}

  async execute(dto: ListPendingEditsForPlaceDTO): Promise<PlaceEditWithVotes[]> {
    return this.editRepo.listWithVoteCounts(dto.placeId, dto.viewerUserId);
  }
}
