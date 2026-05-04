import type { UserList, ListPlace } from '../entities/List';

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
  create(data: CreateListData): Promise<UserList>;
  update(id: string, data: UpdateListData): Promise<UserList>;
  delete(id: string): Promise<void>;
  getPlaces(listId: string): Promise<ListPlace[]>;
  addPlace(listId: string, placeId: string, note?: string): Promise<ListPlace>;
  removePlace(listId: string, placeId: string): Promise<void>;
  isOwner(listId: string, userId: string): Promise<boolean>;
}
