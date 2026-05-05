import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { ReorderListPlacesDTO } from '@/application/dtos/ListDTO';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export class ReorderListPlaces {
  constructor(private readonly listRepo: IListRepository) {}

  async execute(dto: ReorderListPlacesDTO): Promise<void> {
    const isOwner = await this.listRepo.isOwner(dto.listId, dto.userId);
    if (!isOwner) {
      throw new UnauthorizedError('Você não tem permissão para reordenar esta lista');
    }

    await this.listRepo.reorderPlaces(dto.listId, dto.orderedPlaceIds);
  }
}
