import type { UserList } from '@/domain/entities/List';
import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { GetUserListsDTO } from '@/application/dtos/ListDTO';

export class GetUserLists {
  constructor(private readonly listRepo: IListRepository) {}

  async execute(dto: GetUserListsDTO): Promise<UserList[]> {
    return this.listRepo.findByOwner(dto.userId);
  }
}
