export interface CreateListDTO {
  userId: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  coverUrl?: string;
}

export interface UpdateListDTO {
  userId: string;
  listId: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverUrl?: string;
}

export interface DeleteListDTO {
  userId: string;
  listId: string;
}

export interface GetUserListsDTO {
  userId: string;
}

export interface GetListByIdDTO {
  listId: string;
}

export interface AddPlaceToListDTO {
  userId: string;
  listId: string;
  placeId: string;
  note?: string;
}

export interface RemovePlaceFromListDTO {
  userId: string;
  listId: string;
  placeId: string;
}

export interface IncrementListViewDTO {
  listId: string;
}

export interface ToggleListFavoriteDTO {
  userId: string;
  listId: string;
}

export interface ToggleListSaveDTO {
  userId: string;
  listId: string;
}
