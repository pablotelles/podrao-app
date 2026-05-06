import type { CuisineType } from '../value-objects/CuisineType';
import type { FoodType } from '../value-objects/FoodType';
import type { MealType } from '../value-objects/MealType';
import type { PriceBucket } from '../value-objects/PriceBucket';

export type PlaceStatus = 'pending' | 'approved' | 'rejected';

export interface Place {
  id: string;
  name: string;
  address: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  lat: number;
  lng: number;
  establishmentType: string;
  cuisineTypes: CuisineType[];
  mealTypes: MealType[];
  foodTypes: FoodType[];
  priceBucket: PriceBucket;
  description?: string;
  medianPrice?: number;
  /** URL do logo (extraída da relação place_photos where type='logo') */
  logoUrl?: string;
  rating: number;
  reviewsCount: number;
  status: PlaceStatus;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  /** Distância em metros — preenchida nas buscas geográficas */
  distanceM?: number;
}
