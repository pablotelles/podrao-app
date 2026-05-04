export interface UserList {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  coverUrl?: string;
  /** Agregado para exibição — preenchido na query */
  placesCount?: number;
  /** Contadores denormalizados — atualizados via toggles */
  viewCount: number;
  favoritesCount: number;
  savesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListFavorite {
  userId: string;
  listId: string;
  createdAt: Date;
}

export interface ListSave {
  userId: string;
  listId: string;
  createdAt: Date;
}

export interface ListPlace {
  listId: string;
  placeId: string;
  position: number;
  note?: string;
  addedAt: Date;
}
