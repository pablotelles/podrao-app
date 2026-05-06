import type { CuisineType } from '@/domain/value-objects/CuisineType';
import type { FoodType } from '@/domain/value-objects/FoodType';
import type { MealType } from '@/domain/value-objects/MealType';

export interface SearchPlacesDTO {
  lat: number;
  lng: number;
  radiusMeters?: number;
  mealType?: MealType;
  cuisine?: CuisineType;
  foodType?: FoodType;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}
