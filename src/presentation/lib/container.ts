/**
 * Composição raiz — ÚNICO arquivo que instancia implementações concretas.
 * Trocar provedor de mapas = 1 linha aqui. Zero impacto em domain/ ou application/.
 */
import { SupabasePlaceRepository } from '@/infrastructure/database/supabase/SupabasePlaceRepository';
import { SupabaseReviewRepository } from '@/infrastructure/database/supabase/SupabaseReviewRepository';
import { SupabaseUserRepository } from '@/infrastructure/database/supabase/SupabaseUserRepository';
import { UpstashCacheProvider } from '@/infrastructure/cache/UpstashCacheProvider';
import { NullCacheProvider } from '@/infrastructure/cache/NullCacheProvider';
import type { ICacheProvider } from '@/domain/interfaces/ICacheProvider';
import { SupabaseStorageProvider } from '@/infrastructure/storage/SupabaseStorageProvider';
import { LocationIQMapProvider } from '@/infrastructure/maps/LocationIQMapProvider';
import { OpenAIEmbeddingProvider } from '@/infrastructure/ai/OpenAIEmbeddingProvider';
import { NullEmbeddingProvider } from '@/infrastructure/ai/NullEmbeddingProvider';
import type { IEmbeddingProvider } from '@/domain/interfaces/IEmbeddingProvider';

import { SearchNearbyPlaces } from '@/application/use-cases/places/SearchNearbyPlaces';
import { CreatePlace } from '@/application/use-cases/places/CreatePlace';
import { GetPlaceById } from '@/application/use-cases/places/GetPlaceById';
import { ApprovePlace } from '@/application/use-cases/places/ApprovePlace';
import { GeneratePlaceEmbedding } from '@/application/use-cases/places/GeneratePlaceEmbedding';
import { SubmitReview } from '@/application/use-cases/reviews/SubmitReview';
import { GetPlaceReviews } from '@/application/use-cases/reviews/GetPlaceReviews';

// --- Infra ---
const placeRepository = new SupabasePlaceRepository();
const reviewRepository = new SupabaseReviewRepository();
const userRepository = new SupabaseUserRepository();
const cacheProvider: ICacheProvider =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new UpstashCacheProvider()
    : new NullCacheProvider();
const storageProvider = new SupabaseStorageProvider();
const mapProvider = new LocationIQMapProvider(process.env.LOCATIONIQ_API_KEY!);
// Embedding desativado no MVP — ativa quando OPENAI_API_KEY estiver configurada
const embeddingProvider: IEmbeddingProvider = process.env.OPENAI_API_KEY
  ? new OpenAIEmbeddingProvider(process.env.OPENAI_API_KEY)
  : new NullEmbeddingProvider();

// --- Use Cases ---
export const searchNearbyPlaces = new SearchNearbyPlaces(placeRepository, cacheProvider);
export const createPlace = new CreatePlace(placeRepository, cacheProvider);
export const getPlaceById = new GetPlaceById(placeRepository);
export const approvePlace = new ApprovePlace(placeRepository, cacheProvider);
export const generatePlaceEmbedding = new GeneratePlaceEmbedding(placeRepository, embeddingProvider);
export const submitReview = new SubmitReview(reviewRepository, placeRepository);
export const getPlaceReviews = new GetPlaceReviews(reviewRepository, placeRepository);

// --- Providers exportados para uso direto em routes ---
export { mapProvider, storageProvider, userRepository };
