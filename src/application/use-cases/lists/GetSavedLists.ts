import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { UserList } from '@/domain/entities/List';

export interface GetSavedListsDTO {
  userId: string;
}

export class GetSavedLists {
  constructor(private readonly repo: IListRepository) {}

  async execute(dto: GetSavedListsDTO): Promise<UserList[]> {
    return this.repo.getSavedListsByUser(dto.userId);
  }
}
