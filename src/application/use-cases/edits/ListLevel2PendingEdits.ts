import type { PlaceEditWithVotes } from '@/domain/entities/PlaceEdit';
import type { IPlaceEditRepository } from '@/domain/interfaces/IPlaceEditRepository';

export class ListLevel2PendingEdits {
  constructor(private readonly editRepo: IPlaceEditRepository) {}

  async execute(): Promise<PlaceEditWithVotes[]> {
    return this.editRepo.listPendingByLevel(2);
  }
}
