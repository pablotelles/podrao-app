export interface UserList {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  /** Agregado para exibição — preenchido na query */
  placesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListPlace {
  listId: string;
  placeId: string;
  position: number;
  note?: string;
  addedAt: Date;
}
