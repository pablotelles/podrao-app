import type { UserList } from '@/domain/entities/List';
import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { GetListByIdDTO } from '@/application/dtos/ListDTO';

export class GetListById {
  constructor(private readonly listRepo: IListRepository) {}

  async execute(dto: GetListByIdDTO): Promise<UserList | null> {
    return this.listRepo.findById(dto.listId);
  }
}
