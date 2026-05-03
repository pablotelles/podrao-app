import type { CuisineType } from '@/domain/value-objects/CuisineType';
import type { MealType } from '@/domain/value-objects/MealType';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';

export interface CreatePlaceDTO {
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
  priceBucket: PriceBucket;
  photoUrl?: string;
  /** ID do usuário autenticado — preenchido pelo use case, não pelo cliente */
  createdBy: string;
}
