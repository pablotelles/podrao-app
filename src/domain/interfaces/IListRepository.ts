import type { UserList, ListPlace, ListFavorite, ListSave } from '../entities/List';

export interface FindRecentNearbyParams {
  lat?: number;
  lng?: number;
  radiusM?: number;
  since?: Date;
  cursor?: Date;
  limit?: number;
}

export interface FindRecentNearbyResult {
  lists: UserList[];
  nextCursor: Date | null;
}

export interface CreateListData {
  ownerId: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  coverUrl?: string;
  slug?: string | null;
}

export interface UpdateListData {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverUrl?: string;
  slug?: string | null;
}

export interface IListRepository {
  findById(id: string): Promise<UserList | null>;
  findBySlug(slug: string): Promise<UserList | null>;
  searchPublicByText(q: string, limit?: number): Promise<UserList[]>;
  findByOwner(userId: string): Promise<UserList[]>;
  findPublic(limit?: number, offset?: number): Promise<UserList[]>;
  /** Listas em destaque — as mais salvas/favoritadas (sem filtro geo) */
  findFeatured(limit?: number): Promise<UserList[]>;
  /** Listas recentes próximas — via RPC search_recent_lists_nearby */
  findRecentNearby(params: FindRecentNearbyParams): Promise<FindRecentNearbyResult>;
  getSavedListsByUser(userId: string): Promise<UserList[]>;
  create(data: CreateListData): Promise<UserList>;
  update(id: string, data: UpdateListData): Promise<UserList>;
  delete(id: string): Promise<void>;
  getPlaces(listId: string): Promise<ListPlace[]>;
  addPlace(listId: string, placeId: string, note?: string): Promise<ListPlace>;
  removePlace(listId: string, placeId: string): Promise<void>;
  reorderPlaces(listId: string, orderedPlaceIds: string[]): Promise<void>;
  isOwner(listId: string, userId: string): Promise<boolean>;

  /** Retorna os IDs das listas do usuário que já contêm o lugar. */
  findListIdsContainingPlace(userId: string, placeId: string): Promise<string[]>;

  // Social interactions
  incrementViewCount(listId: string): Promise<void>;
  toggleFavorite(userId: string, listId: string): Promise<{ favorited: boolean }>;
  toggleSave(userId: string, listId: string): Promise<{ saved: boolean }>;
  isFavoritedByUser(userId: string, listId: string): Promise<boolean>;
  isSavedByUser(userId: string, listId: string): Promise<boolean>;
  getFavoritesByUser(userId: string): Promise<ListFavorite[]>;
  getSavesByUser(userId: string): Promise<ListSave[]>;
}
