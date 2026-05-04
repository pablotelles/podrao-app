/**
 * Composição raiz — ÚNICO arquivo que instancia implementações concretas.
 * Trocar provedor de mapas = 1 linha aqui. Zero impacto em domain/ ou application/.
 */
import { SupabasePlaceRepository } from '@/infrastructure/database/supabase/SupabasePlaceRepository';
import { SupabaseReviewRepository } from '@/infrastructure/database/supabase/SupabaseReviewRepository';
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
import { GeneratePlaceEmbedding } from '@/application/use-cases/places/GeneratePlaceEmbedding';
import { GetMyPlaces } from '@/application/use-cases/places/GetMyPlaces';
import { GetFavoritePlaces } from '@/application/use-cases/places/GetFavoritePlaces';
import { SubmitReview } from '@/application/use-cases/reviews/SubmitReview';
import { GetPlaceReviews } from '@/application/use-cases/reviews/GetPlaceReviews';
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
import { GetUserStats } from '@/application/use-cases/user/GetUserStats';

// --- Infra ---
const placeRepository = new SupabasePlaceRepository();
const reviewRepository = new SupabaseReviewRepository();
const favoriteRepository = new SupabaseFavoriteRepository();
const listRepository = new SupabaseListRepository();
export const cacheProvider: ICacheProvider =
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
export const getMyPlaces = new GetMyPlaces(placeRepository);
export const getFavoritePlaces = new GetFavoritePlaces(placeRepository);
export const generatePlaceEmbedding = new GeneratePlaceEmbedding(
  placeRepository,
  embeddingProvider,
);
export const submitReview = new SubmitReview(reviewRepository, placeRepository);
export const getPlaceReviews = new GetPlaceReviews(reviewRepository, placeRepository);

// Favorites
export const toggleFavorite = new ToggleFavorite(favoriteRepository);
export const getUserFavorites = new GetUserFavorites(favoriteRepository);

// Lists
export const createList = new CreateList(listRepository);
export const deleteList = new DeleteList(listRepository);
export const getUserLists = new GetUserLists(listRepository);
export const getListById = new GetListById(listRepository);
export const addPlaceToList = new AddPlaceToList(listRepository);
export const removePlaceFromList = new RemovePlaceFromList(listRepository);
export const updateList = new UpdateList(listRepository);
export const getListPlaces = new GetListPlaces(listRepository);
export const incrementListView = new IncrementListView(listRepository);
export const toggleListFavorite = new ToggleListFavorite(listRepository);
export const toggleListSave = new ToggleListSave(listRepository);
export const getPublicLists = new GetPublicLists(listRepository);
export const getSavedLists = new GetSavedLists(listRepository);

// User stats
export const getUserStats = new GetUserStats(placeRepository, reviewRepository, favoriteRepository);

// --- Providers exportados para uso direto em routes ---
// Nota: UserRepository agora é instanciado com cliente autenticado em cada route
export { mapProvider, storageProvider };
