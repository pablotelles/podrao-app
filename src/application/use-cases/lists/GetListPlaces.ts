import type { ListPlace } from '@/domain/entities/List';
import type { IListRepository } from '@/domain/interfaces/IListRepository';

export class GetListPlaces {
  constructor(private readonly listRepo: IListRepository) {}

  async execute(listId: string): Promise<ListPlace[]> {
    return this.listRepo.getPlaces(listId);
  }
}
