import { z } from 'zod';
import { CUISINE_TYPES } from '@/domain/value-objects/CuisineType';
import { MEAL_TYPES } from '@/domain/value-objects/MealType';
import { PRICE_BUCKETS } from '@/domain/value-objects/PriceBucket';

export const createPlaceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(120),
  address: z.string().min(5, 'Endereço inválido'),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().min(2),
  estado: z.string().length(2, 'Use a sigla do estado (ex: SP)'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  establishmentType: z.string().min(2),
  cuisineTypes: z
    .array(z.enum(CUISINE_TYPES))
    .min(1, 'Selecione ao menos um tipo de cozinha'),
  mealTypes: z
    .array(z.enum(MEAL_TYPES))
    .min(1, 'Selecione ao menos um tipo de refeição'),
  priceBucket: z.enum(PRICE_BUCKETS),
  photoUrl: z.string().url().optional(),
});

export const searchPlacesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(50000).optional(),
  meal: z.enum(MEAL_TYPES).optional(),
  cuisine: z.enum(CUISINE_TYPES).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  offset: z.coerce.number().min(0).optional(),
});

export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
export type SearchPlacesInput = z.infer<typeof searchPlacesSchema>;
