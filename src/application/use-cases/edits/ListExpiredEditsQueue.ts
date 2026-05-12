import type { PlaceEditWithVotes } from '@/domain/entities/PlaceEdit';
import type { IPlaceEditRepository } from '@/domain/interfaces/IPlaceEditRepository';

export class ListExpiredEditsQueue {
  constructor(private readonly editRepo: IPlaceEditRepository) {}

  async execute(): Promise<PlaceEditWithVotes[]> {
    return this.editRepo.listExpired();
  }
}
