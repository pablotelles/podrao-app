import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { SearchAllDTO, SearchAllResult } from '@/application/dtos/SearchDTO';

export class SearchAll {
  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly listRepo: IListRepository,
  ) {}

  async execute(dto: SearchAllDTO): Promise<SearchAllResult> {
    const limit = dto.limit ?? 20;

    const [places, lists] = await Promise.all([
      this.placeRepo.searchByText(dto.q, limit),
      this.listRepo.searchPublicByText(dto.q, limit),
    ]);

    return { places, lists };
  }
}
