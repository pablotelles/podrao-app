import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { UserList } from '@/domain/entities/List';

export interface GetPublicListsDTO {
  limit?: number;
  offset?: number;
}

export class GetPublicLists {
  constructor(private readonly repo: IListRepository) {}

  async execute(dto: GetPublicListsDTO = {}): Promise<UserList[]> {
    return this.repo.findPublic(dto.limit, dto.offset);
  }
}
