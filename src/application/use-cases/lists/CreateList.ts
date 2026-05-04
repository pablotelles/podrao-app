import type { UserList } from '@/domain/entities/List';
import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { CreateListDTO } from '@/application/dtos/ListDTO';
import { ValidationError } from '@/application/errors/ValidationError';

export class CreateList {
  constructor(private readonly listRepo: IListRepository) {}

  async execute(dto: CreateListDTO): Promise<UserList> {
    const trimmedName = dto.name.trim();
    if (trimmedName.length === 0) {
      throw new ValidationError('Nome da lista não pode ser vazio');
    }

    return this.listRepo.create({
      ownerId: dto.userId,
      name: trimmedName,
      description: dto.description,
      isPublic: dto.isPublic ?? true,
    });
  }
}
