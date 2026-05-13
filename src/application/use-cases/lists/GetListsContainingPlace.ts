import type { IListRepository } from '@/domain/interfaces/IListRepository';

export interface GetListsContainingPlaceDTO {
  userId: string;
  placeId: string;
}

export class GetListsContainingPlace {
  constructor(private readonly listRepo: IListRepository) {}

  async execute(dto: GetListsContainingPlaceDTO): Promise<string[]> {
    return this.listRepo.findListIdsContainingPlace(dto.userId, dto.placeId);
  }
}
