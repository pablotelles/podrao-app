import type { Place } from '@/domain/entities/Place';
import type { UserList } from '@/domain/entities/List';

export interface SearchAllDTO {
  q: string;
  limit?: number;
}

export interface SearchAllResult {
  places: Place[];
  lists: UserList[];
}
