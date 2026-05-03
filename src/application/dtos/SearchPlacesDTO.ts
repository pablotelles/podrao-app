import type { CuisineType } from '@/domain/value-objects/CuisineType';
import type { MealType } from '@/domain/value-objects/MealType';

export interface SearchPlacesDTO {
  lat: number;
  lng: number;
  radiusMeters?: number;
  mealType?: MealType;
  cuisine?: CuisineType;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}
