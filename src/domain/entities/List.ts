export interface UserList {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  coverUrl?: string;
  /** SEO-friendly slug — null for private lists */
  slug?: string | null;
  /** Agregado para exibição — preenchido na query */
  placesCount?: number;
  /** Contadores denormalizados — atualizados via toggles */
  viewCount: number;
  favoritesCount: number;
  savesCount: number;
  createdAt: Date;
  updatedAt: Date;
  /** Faixa de preço dos lugares da lista (derivada de place_stats.median_price) */
  priceRangeMin?: number;
  priceRangeMax?: number;
  /** Bairro predominante dos lugares da lista (primeiro lugar por position) */
  bairro?: string;
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
