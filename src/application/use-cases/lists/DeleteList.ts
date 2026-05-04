import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { DeleteListDTO } from '@/application/dtos/ListDTO';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export class DeleteList {
  constructor(private readonly listRepo: IListRepository) {}

  async execute(dto: DeleteListDTO): Promise<void> {
    const isOwner = await this.listRepo.isOwner(dto.listId, dto.userId);
    if (!isOwner) {
      throw new UnauthorizedError('Você não tem permissão para deletar esta lista');
    }

    await this.listRepo.delete(dto.listId);
  }
}
