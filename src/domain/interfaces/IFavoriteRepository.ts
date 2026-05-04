import type { Favorite } from '../entities/Favorite';

export interface IFavoriteRepository {
  isFavorited(userId: string, placeId: string): Promise<boolean>;
  getFavoritesByUser(userId: string): Promise<Favorite[]>;
  add(userId: string, placeId: string): Promise<Favorite>;
  remove(userId: string, placeId: string): Promise<void>;
}
