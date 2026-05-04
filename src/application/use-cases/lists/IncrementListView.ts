import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { IncrementListViewDTO } from '@/application/dtos/ListDTO';

export class IncrementListView {
  constructor(private readonly repo: IListRepository) {}

  async execute(dto: IncrementListViewDTO): Promise<void> {
    await this.repo.incrementViewCount(dto.listId);
  }
}
