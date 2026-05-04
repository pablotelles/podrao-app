import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { ToggleListSaveDTO } from '@/application/dtos/ListDTO';

export class ToggleListSave {
  constructor(private readonly repo: IListRepository) {}

  async execute(dto: ToggleListSaveDTO): Promise<{ saved: boolean }> {
    return this.repo.toggleSave(dto.userId, dto.listId);
  }
}
