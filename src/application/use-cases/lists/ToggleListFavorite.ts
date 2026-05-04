import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { ToggleListFavoriteDTO } from '@/application/dtos/ListDTO';

export class ToggleListFavorite {
  constructor(private readonly repo: IListRepository) {}

  async execute(dto: ToggleListFavoriteDTO): Promise<{ favorited: boolean }> {
    return this.repo.toggleFavorite(dto.userId, dto.listId);
  }
}
