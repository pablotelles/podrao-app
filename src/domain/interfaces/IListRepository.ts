import type { UserList, ListPlace, ListFavorite, ListSave } from '../entities/List';

export interface CreateListData {
  ownerId: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  coverUrl?: string;
}

export interface UpdateListData {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverUrl?: string;
}

export interface IListRepository {
  findById(id: string): Promise<UserList | null>;
  findByOwner(userId: string): Promise<UserList[]>;
  findPublic(limit?: number, offset?: number): Promise<UserList[]>;
  getSavedListsByUser(userId: string): Promise<UserList[]>;
  create(data: CreateListData): Promise<UserList>;
  update(id: string, data: UpdateListData): Promise<UserList>;
  delete(id: string): Promise<void>;
  getPlaces(listId: string): Promise<ListPlace[]>;
  addPlace(listId: string, placeId: string, note?: string): Promise<ListPlace>;
  removePlace(listId: string, placeId: string): Promise<void>;
  isOwner(listId: string, userId: string): Promise<boolean>;

  // Social interactions
  incrementViewCount(listId: string): Promise<void>;
  toggleFavorite(userId: string, listId: string): Promise<{ favorited: boolean }>;
  toggleSave(userId: string, listId: string): Promise<{ saved: boolean }>;
  isFavoritedByUser(userId: string, listId: string): Promise<boolean>;
  isSavedByUser(userId: string, listId: string): Promise<boolean>;
  getFavoritesByUser(userId: string): Promise<ListFavorite[]>;
  getSavesByUser(userId: string): Promise<ListSave[]>;
}
