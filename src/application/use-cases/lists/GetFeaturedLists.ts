import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { ListSummaryDTO, GetFeaturedListsDTO } from '@/application/dtos/ListDTO';
import { toSummary } from './listMappers';

export class GetFeaturedLists {
  constructor(private readonly repo: IListRepository) {}

  async execute(dto: GetFeaturedListsDTO = {}): Promise<ListSummaryDTO[]> {
    const limit = dto.limit ?? 4;
    const lists = await this.repo.findFeatured(limit);
    return lists.map(toSummary);
  }
}
