import type { UserList } from '@/domain/entities/List';
import type { IListRepository } from '@/domain/interfaces/IListRepository';

export class GetListBySlug {
  constructor(private readonly repo: IListRepository) {}

  async execute(slug: string): Promise<UserList | null> {
    return this.repo.findBySlug(slug);
  }
}
