import type { ListPlace } from '@/domain/entities/List';
import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { AddPlaceToListDTO } from '@/application/dtos/ListDTO';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export class AddPlaceToList {
  constructor(private readonly listRepo: IListRepository) {}

  async execute(dto: AddPlaceToListDTO): Promise<ListPlace> {
    const isOwner = await this.listRepo.isOwner(dto.listId, dto.userId);
    if (!isOwner) {
      throw new UnauthorizedError('Você não tem permissão para adicionar lugares a esta lista');
    }

    return this.listRepo.addPlace(dto.listId, dto.placeId, dto.note);
  }
}
