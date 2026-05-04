import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { RemovePlaceFromListDTO } from '@/application/dtos/ListDTO';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export class RemovePlaceFromList {
  constructor(private readonly listRepo: IListRepository) {}

  async execute(dto: RemovePlaceFromListDTO): Promise<void> {
    const isOwner = await this.listRepo.isOwner(dto.listId, dto.userId);
    if (!isOwner) {
      throw new UnauthorizedError('Você não tem permissão para remover lugares desta lista');
    }

    await this.listRepo.removePlace(dto.listId, dto.placeId);
  }
}
