import type { ListSummaryDTO } from '@/application/dtos/ListDTO';
import type { UserList } from '@/domain/entities/List';

export function toSummary(list: UserList): ListSummaryDTO {
  return {
    id: list.id,
    title: list.name,
    coverUrl: list.coverUrl ?? null,
    bairro: list.bairro ?? '',
    lugaresCount: list.placesCount ?? 0,
    savesCount: list.savesCount,
    priceRangeMin: list.priceRangeMin ?? null,
    priceRangeMax: list.priceRangeMax ?? null,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
  };
}
