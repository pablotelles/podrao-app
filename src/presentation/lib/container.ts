/**
 * Composição raiz — ÚNICO arquivo que instancia implementações concretas.
 * Trocar provedor de mapas = 1 linha aqui. Zero impacto em domain/ ou application/.
 */
import { SupabasePlaceRepository } from '@/infrastructure/database/supabase/SupabasePlaceRepository';
import { SupabaseReviewRepository } from '@/infrastructure/database/supabase/SupabaseReviewRepository';
import { SupabaseReactionRepository } from '@/infrastructure/database/supabase/SupabaseReactionRepository';
import { SupabaseFavoriteRepository } from '@/infrastructure/database/supabase/SupabaseFavoriteRepository';
import { SupabaseListRepository } from '@/infrastructure/database/supabase/SupabaseListRepository';
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
import { GetPendingPlaces } from '@/application/use-cases/places/GetPendingPlaces';
import { RejectPlace } from '@/application/use-cases/places/RejectPlace';
import { GeneratePlaceEmbedding } from '@/application/use-cases/places/GeneratePlaceEmbedding';
import { GetMyPlaces } from '@/application/use-cases/places/GetMyPlaces';
import { GetFavoritePlaces } from '@/application/use-cases/places/GetFavoritePlaces';
import { SubmitReview } from '@/application/use-cases/reviews/SubmitReview';
import { GetPlaceReviews } from '@/application/use-cases/reviews/GetPlaceReviews';
import { ToggleReaction } from '@/application/use-cases/reactions/ToggleReaction';
import { ToggleFavorite } from '@/application/use-cases/favorites/ToggleFavorite';
import { GetUserFavorites } from '@/application/use-cases/favorites/GetUserFavorites';
import { CreateList } from '@/application/use-cases/lists/CreateList';
import { DeleteList } from '@/application/use-cases/lists/DeleteList';
import { GetUserLists } from '@/application/use-cases/lists/GetUserLists';
import { GetListById } from '@/application/use-cases/lists/GetListById';
import { AddPlaceToList } from '@/application/use-cases/lists/AddPlaceToList';
import { RemovePlaceFromList } from '@/application/use-cases/lists/RemovePlaceFromList';
import { UpdateList } from '@/application/use-cases/lists/UpdateList';
import { GetListPlaces } from '@/application/use-cases/lists/GetListPlaces';
import { IncrementListView } from '@/application/use-cases/lists/IncrementListView';
import { ToggleListFavorite } from '@/application/use-cases/lists/ToggleListFavorite';
import { ToggleListSave } from '@/application/use-cases/lists/ToggleListSave';
import { GetPublicLists } from '@/application/use-cases/lists/GetPublicLists';
import { GetSavedLists } from '@/application/use-cases/lists/GetSavedLists';
import { ReorderListPlaces } from '@/application/use-cases/lists/ReorderListPlaces';
import { GetUserStats } from '@/application/use-cases/user/GetUserStats';
import { GetMyReviews } from '@/application/use-cases/reviews/GetMyReviews';

function lazySingleton<T extends object>(factory: () => T): T {
  let instance: T | undefined;

  return new Proxy({} as T, {
    get(_target, prop) {
      if (!instance) {
        instance = factory();
      }

      const value = Reflect.get(instance, prop);
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  });
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

// --- Infra ---
const placeRepository = lazySingleton(() => new SupabasePlaceRepository());
const reactionRepository = lazySingleton(() => new SupabaseReactionRepository());
const reviewRepository = lazySingleton(() => new SupabaseReviewRepository());
const favoriteRepository = lazySingleton(() => new SupabaseFavoriteRepository());
const listRepository = lazySingleton(() => new SupabaseListRepository());
export const cacheProvider: ICacheProvider = lazySingleton(() =>
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new UpstashCacheProvider()
    : new NullCacheProvider(),
);
const storageProvider = lazySingleton(() => new SupabaseStorageProvider());
const mapProvider = lazySingleton(
  () => new LocationIQMapProvider(requireEnv('LOCATIONIQ_API_KEY')),
);
// Embedding desativado no MVP — ativa quando OPENAI_API_KEY estiver configurada
const embeddingProvider: IEmbeddingProvider = lazySingleton(() =>
  process.env.OPENAI_API_KEY
    ? new OpenAIEmbeddingProvider(process.env.OPENAI_API_KEY)
    : new NullEmbeddingProvider(),
);

// --- Use Cases ---
export const searchNearbyPlaces = lazySingleton(
  () => new SearchNearbyPlaces(placeRepository, cacheProvider),
);
export const createPlace = lazySingleton(() => new CreatePlace(placeRepository, cacheProvider));
export const getPlaceById = lazySingleton(() => new GetPlaceById(placeRepository));
export const approvePlace = lazySingleton(() => new ApprovePlace(placeRepository, cacheProvider));
export const getPendingPlaces = lazySingleton(() => new GetPendingPlaces(placeRepository));
export const rejectPlace = lazySingleton(() => new RejectPlace(placeRepository));
export const getMyPlaces = lazySingleton(() => new GetMyPlaces(placeRepository));
export const getFavoritePlaces = lazySingleton(() => new GetFavoritePlaces(placeRepository));
export const generatePlaceEmbedding = lazySingleton(
  () => new GeneratePlaceEmbedding(placeRepository, embeddingProvider),
);
export const submitReview = lazySingleton(
  () => new SubmitReview(reviewRepository, placeRepository),
);
export const getPlaceReviews = lazySingleton(
  () => new GetPlaceReviews(reviewRepository, placeRepository),
);
export const toggleReaction = lazySingleton(() => new ToggleReaction(reactionRepository));

// Favorites
export const toggleFavorite = lazySingleton(() => new ToggleFavorite(favoriteRepository));
export const getUserFavorites = lazySingleton(() => new GetUserFavorites(favoriteRepository));

// Lists
export const createList = lazySingleton(() => new CreateList(listRepository));
export const deleteList = lazySingleton(() => new DeleteList(listRepository));
export const getUserLists = lazySingleton(() => new GetUserLists(listRepository));
export const getListById = lazySingleton(() => new GetListById(listRepository));
export const addPlaceToList = lazySingleton(() => new AddPlaceToList(listRepository));
export const removePlaceFromList = lazySingleton(() => new RemovePlaceFromList(listRepository));
export const updateList = lazySingleton(() => new UpdateList(listRepository));
export const getListPlaces = lazySingleton(() => new GetListPlaces(listRepository));
export const incrementListView = lazySingleton(() => new IncrementListView(listRepository));
export const toggleListFavorite = lazySingleton(() => new ToggleListFavorite(listRepository));
export const toggleListSave = lazySingleton(() => new ToggleListSave(listRepository));
export const getPublicLists = lazySingleton(() => new GetPublicLists(listRepository));
export const getSavedLists = lazySingleton(() => new GetSavedLists(listRepository));
export const reorderListPlaces = lazySingleton(() => new ReorderListPlaces(listRepository));

// User stats
export const getUserStats = lazySingleton(
  () => new GetUserStats(placeRepository, reviewRepository, favoriteRepository),
);

// My reviews
export const getMyReviews = lazySingleton(
  () => new GetMyReviews(reviewRepository, placeRepository),
);

// --- Providers exportados para uso direto em routes ---
// Nota: UserRepository agora é instanciado com cliente autenticado em cada route
export { mapProvider, storageProvider };
