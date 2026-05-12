import type { PlaceEditWithVotes } from '@/domain/entities/PlaceEdit';
import type { IPlaceEditRepository } from '@/domain/interfaces/IPlaceEditRepository';

export interface GetEditWithVotesDTO {
  editId: string;
  viewerUserId?: string;
}

export class GetEditWithVotes {
  constructor(private readonly editRepo: IPlaceEditRepository) {}

  async execute(dto: GetEditWithVotesDTO): Promise<PlaceEditWithVotes | null> {
    return this.editRepo.findWithVoteCounts(dto.editId, dto.viewerUserId);
  }
}
