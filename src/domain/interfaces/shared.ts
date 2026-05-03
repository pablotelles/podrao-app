import type { CuisineType } from '../value-objects/CuisineType';
import type { MealType } from '../value-objects/MealType';
import type { PriceBucket } from '../value-objects/PriceBucket';

/** Parâmetros de busca geográfica com filtros opcionais */
export interface SearchPlacesParams {
  lat: number;
  lng: number;
  radiusMeters?: number;
  mealType?: MealType;
  cuisine?: CuisineType;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

/** Dados para criação de um novo lugar */
export interface CreatePlaceData {
  name: string;
  address: string;
  bairro?: string;
  cidade: string;
  estado: string;
  lat: number;
  lng: number;
  establishmentType: string;
  cuisineTypes: CuisineType[];
  mealTypes: MealType[];
  priceBucket: PriceBucket;
  photoUrl?: string;
  createdBy: string;
}
