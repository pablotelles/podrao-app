export interface CreateListDTO {
  userId: string;
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateListDTO {
  userId: string;
  listId: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
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
