import type { PlaceEditWithPlace } from '@/domain/entities/PlaceEdit';
import type { IPlaceEditRepository } from '@/domain/interfaces/IPlaceEditRepository';

export interface ListMyEditsDTO {
  userId: string;
}

export class ListMyEdits {
  constructor(private readonly editRepo: IPlaceEditRepository) {}

  async execute(dto: ListMyEditsDTO): Promise<PlaceEditWithPlace[]> {
    return this.editRepo.listByUserWithContext(dto.userId);
  }
}
