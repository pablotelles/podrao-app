import type { UserList } from '@/domain/entities/List';
import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { UpdateListDTO } from '@/application/dtos/ListDTO';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { ValidationError } from '@/application/errors/ValidationError';

export class UpdateList {
  constructor(private readonly listRepo: IListRepository) {}

  async execute(dto: UpdateListDTO): Promise<UserList> {
    const isOwner = await this.listRepo.isOwner(dto.listId, dto.userId);
    if (!isOwner) {
      throw new UnauthorizedError('Você não tem permissão para atualizar esta lista');
    }

    if (dto.name !== undefined) {
      const trimmedName = dto.name.trim();
      if (trimmedName.length === 0) {
        throw new ValidationError('Nome da lista não pode ser vazio');
      }
      dto.name = trimmedName;
    }

    return this.listRepo.update(dto.listId, {
      name: dto.name,
      description: dto.description,
      isPublic: dto.isPublic,
    });
  }
}
