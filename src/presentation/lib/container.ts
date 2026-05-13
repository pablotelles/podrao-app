/**
 * Composição raiz — ÚNICO arquivo que instancia implementações concretas.
 * Trocar provedor de mapas = 1 linha aqui. Zero impacto em domain/ ou application/.
 */
import { SupabasePlaceRepository } from '@/infrastructure/database/supabase/SupabasePlaceRepository';
import { SupabaseReviewRepository } from '@/infrastructure/database/supabase/SupabaseReviewRepository';
import { SupabaseReactionRepository } from '@/infrastructure/database/supabase/SupabaseReactionRepository';
import { SupabaseFavoriteRepository } from '@/infrastructure/database/supabase/SupabaseFavoriteRepository';
import { SupabaseListRepository } from '@/infrastructure/database/supabase/SupabaseListRepository';
import { SupabaseUserRepository } from '@/infrastructure/database/supabase/SupabaseUserRepository';
import { createAdminClient } from '@/infrastructure/database/supabase/client';
import { UpstashCacheProvider } from '@/infrastructure/cache/UpstashCacheProvider';
import { NullCacheProvider } from '@/infrastructure/cache/NullCacheProvider';
import type { ICacheProvider } from '@/domain/interfaces/ICacheProvider';
import { SupabaseStorageProvider } from '@/infrastructure/storage/SupabaseStorageProvider';
import { LocationIQMapProvider } from '@/infrastructure/maps/LocationIQMapProvider';
import { GoogleMapsMapProvider } from '@/infrastructure/maps/GoogleMapsMapProvider';
import type { IMapProvider } from '@/domain/interfaces/IMapProvider';
import { OpenAIEmbeddingProvider } from '@/infrastructure/ai/OpenAIEmbeddingProvider';
import { NullEmbeddingProvider } from '@/infrastructure/ai/NullEmbeddingProvider';
import type { IEmbeddingProvider } from '@/domain/interfaces/IEmbeddingProvider';
import { ResendEmailProvider } from '@/infrastructure/email/ResendEmailProvider';
import { NullEmailProvider } from '@/infrastructure/email/NullEmailProvider';
import type { IEmailProvider } from '@/domain/interfaces/IEmailProvider';
import { ResendEmailTemplateProvider } from '@/infrastructure/email/ResendEmailTemplateProvider';

import { SupabasePlaceVisitRepository } from '@/infrastructure/database/supabase/SupabasePlaceVisitRepository';
import { SupabasePlaceEditRepository } from '@/infrastructure/database/supabase/SupabasePlaceEditRepository';
import { SupabaseEditVoteRepository } from '@/infrastructure/database/supabase/SupabaseEditVoteRepository';
import { SupabaseEditApplier } from '@/infrastructure/database/supabase/SupabaseEditApplier';
import { ResendEditEmailTemplateProvider } from '@/infrastructure/email/ResendEditEmailTemplateProvider';

import { SendEditOutcomeEmail } from '@/application/use-cases/email/SendEditOutcomeEmail';
import { ProposeEdit } from '@/application/use-cases/edits/ProposeEdit';
import { VoteOnEdit } from '@/application/use-cases/edits/VoteOnEdit';
import { EvaluateEditThreshold } from '@/application/use-cases/edits/EvaluateEditThreshold';
import { ApplyApprovedEdit } from '@/application/use-cases/edits/ApplyApprovedEdit';
import { RejectEdit } from '@/application/use-cases/edits/RejectEdit';
import { ApproveEditByAdmin } from '@/application/use-cases/edits/ApproveEditByAdmin';
import { RejectEditByAdmin } from '@/application/use-cases/edits/RejectEditByAdmin';
import { ListPendingEditsForPlace } from '@/application/use-cases/edits/ListPendingEditsForPlace';
import { ListExpiredEditsQueue } from '@/application/use-cases/edits/ListExpiredEditsQueue';
import { ListLevel2PendingEdits } from '@/application/use-cases/edits/ListLevel2PendingEdits';
import { ExpireOldEdits } from '@/application/use-cases/edits/ExpireOldEdits';
import { GetEditWithVotes } from '@/application/use-cases/edits/GetEditWithVotes';
import { ListMyEdits } from '@/application/use-cases/edits/ListMyEdits';

import { SearchNearbyPlaces } from '@/application/use-cases/places/SearchNearbyPlaces';
import { CreatePlace } from '@/application/use-cases/places/CreatePlace';
import { GetPlaceById } from '@/application/use-cases/places/GetPlaceById';
import { ApprovePlace } from '@/application/use-cases/places/ApprovePlace';
import { GetPendingPlaces } from '@/application/use-cases/places/GetPendingPlaces';
import { RejectPlace } from '@/application/use-cases/places/RejectPlace';
import { SendPlaceLifecycleEmail } from '@/application/use-cases/email/SendPlaceLifecycleEmail';
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
import { GetFeaturedLists } from '@/application/use-cases/lists/GetFeaturedLists';
import { GetRecentLists } from '@/application/use-cases/lists/GetRecentLists';
import { GetListsContainingPlace } from '@/application/use-cases/lists/GetListsContainingPlace';
import { ReorderListPlaces } from '@/application/use-cases/lists/ReorderListPlaces';
import { GetUserStats } from '@/application/use-cases/user/GetUserStats';
import { GetMyReviews } from '@/application/use-cases/reviews/GetMyReviews';
import { SearchAll } from '@/application/use-cases/search/SearchAll';
import { GetPlaceBySlug } from '@/application/use-cases/places/GetPlaceBySlug';
import { GetListBySlug } from '@/application/use-cases/lists/GetListBySlug';
import { RegisterVisit } from '@/application/use-cases/visits/RegisterVisit';
import { GetPlaceVisitStats } from '@/application/use-cases/visits/GetPlaceVisitStats';

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
export const placeVisitRepository = lazySingleton(
  () => new SupabasePlaceVisitRepository(createAdminClient()),
);
const placeEditRepository = lazySingleton(() => new SupabasePlaceEditRepository());
const editVoteRepository = lazySingleton(() => new SupabaseEditVoteRepository());
const editApplier = lazySingleton(() => new SupabaseEditApplier(createAdminClient()));
const placeRepository = lazySingleton(() => new SupabasePlaceRepository());
const reactionRepository = lazySingleton(() => new SupabaseReactionRepository());
const reviewRepository = lazySingleton(() => new SupabaseReviewRepository());
const favoriteRepository = lazySingleton(() => new SupabaseFavoriteRepository());
const listRepository = lazySingleton(() => new SupabaseListRepository());
// Admin client: bypassa RLS para leitura de perfis server-side (ex: lookup de email para envio de email)
const userRepository = lazySingleton(() => new SupabaseUserRepository(createAdminClient()));
export const cacheProvider: ICacheProvider = lazySingleton(() =>
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new UpstashCacheProvider()
    : new NullCacheProvider(),
);
const storageProvider = lazySingleton(() => new SupabaseStorageProvider());
const adminStorageProvider = lazySingleton(() => new SupabaseStorageProvider(createAdminClient()));
const mapProvider: IMapProvider = lazySingleton(() => {
  const provider = process.env.MAP_PROVIDER ?? 'locationiq';
  if (provider === 'google') {
    return new GoogleMapsMapProvider(requireEnv('GOOGLE_MAPS_API_KEY'));
  }
  return new LocationIQMapProvider(requireEnv('LOCATIONIQ_API_KEY'));
});
// Embedding desativado no MVP — ativa quando OPENAI_API_KEY estiver configurada
const embeddingProvider: IEmbeddingProvider = lazySingleton(() =>
  process.env.OPENAI_API_KEY
    ? new OpenAIEmbeddingProvider(process.env.OPENAI_API_KEY)
    : new NullEmbeddingProvider(),
);
// Email — ativa quando RESEND_API_KEY estiver configurada
const emailProvider: IEmailProvider = lazySingleton(() =>
  process.env.RESEND_API_KEY
    ? new ResendEmailProvider(
        process.env.RESEND_API_KEY,
        process.env.EMAIL_FROM ?? 'noreply@podrao.com.br',
        process.env.EMAIL_DEV_OVERRIDE,
      )
    : new NullEmailProvider(),
);
const emailTemplateProvider = lazySingleton(() => new ResendEmailTemplateProvider());

// --- Use Cases ---
export const sendPlaceLifecycleEmail = lazySingleton(
  () =>
    new SendPlaceLifecycleEmail(
      placeRepository,
      userRepository,
      emailProvider,
      emailTemplateProvider,
      process.env.NEXT_PUBLIC_APP_URL ?? '',
    ),
);

export const searchNearbyPlaces = lazySingleton(
  () => new SearchNearbyPlaces(placeRepository, cacheProvider),
);
export const createPlace = lazySingleton(
  () => new CreatePlace(placeRepository, cacheProvider, sendPlaceLifecycleEmail),
);
export const getPlaceById = lazySingleton(() => new GetPlaceById(placeRepository));
export const approvePlace = lazySingleton(
  () => new ApprovePlace(placeRepository, cacheProvider, sendPlaceLifecycleEmail),
);
export const getPendingPlaces = lazySingleton(() => new GetPendingPlaces(placeRepository));
export const rejectPlace = lazySingleton(
  () => new RejectPlace(placeRepository, sendPlaceLifecycleEmail),
);
export const getMyPlaces = lazySingleton(() => new GetMyPlaces(placeRepository));
export const getFavoritePlaces = lazySingleton(() => new GetFavoritePlaces(placeRepository));
export const generatePlaceEmbedding = lazySingleton(
  () => new GeneratePlaceEmbedding(placeRepository, embeddingProvider),
);
export const submitReview = lazySingleton(
  () => new SubmitReview(reviewRepository, placeRepository, placeVisitRepository),
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
export const getFeaturedLists = lazySingleton(() => new GetFeaturedLists(listRepository));
export const getRecentLists = lazySingleton(() => new GetRecentLists(listRepository));
export const getListsContainingPlace = lazySingleton(
  () => new GetListsContainingPlace(listRepository),
);

// User stats
export const getUserStats = lazySingleton(
  () => new GetUserStats(placeRepository, reviewRepository, favoriteRepository),
);

// My reviews
export const getMyReviews = lazySingleton(
  () => new GetMyReviews(reviewRepository, placeRepository),
);

// Search
export const searchAll = lazySingleton(() => new SearchAll(placeRepository, listRepository));
export const getPlaceBySlug = lazySingleton(() => new GetPlaceBySlug(placeRepository));
export const getListBySlug = lazySingleton(() => new GetListBySlug(listRepository));

// Visit use cases
export const registerVisit = lazySingleton(
  () => new RegisterVisit(placeRepository, placeVisitRepository),
);
export const getPlaceVisitStats = lazySingleton(() => new GetPlaceVisitStats(placeVisitRepository));

// --- Edit system ---
const editEmailTemplateProvider = lazySingleton(() => new ResendEditEmailTemplateProvider());

const sendEditOutcomeEmail = lazySingleton(
  () =>
    new SendEditOutcomeEmail(
      placeEditRepository,
      userRepository,
      emailProvider,
      editEmailTemplateProvider,
      process.env.NEXT_PUBLIC_APP_URL ?? '',
    ),
);

const applyApprovedEdit = lazySingleton(
  () => new ApplyApprovedEdit(editApplier, cacheProvider, sendEditOutcomeEmail),
);

const rejectEdit = lazySingleton(() => new RejectEdit(placeEditRepository, sendEditOutcomeEmail));

const evaluateEditThreshold = lazySingleton(
  () =>
    new EvaluateEditThreshold(
      placeEditRepository,
      editVoteRepository,
      applyApprovedEdit,
      rejectEdit,
    ),
);

export const proposeEdit = lazySingleton(
  () => new ProposeEdit(placeEditRepository, placeRepository),
);

export const voteOnEdit = lazySingleton(
  () => new VoteOnEdit(placeEditRepository, editVoteRepository, evaluateEditThreshold),
);

export const approveEditByAdmin = lazySingleton(
  () => new ApproveEditByAdmin(placeEditRepository, applyApprovedEdit),
);

export const rejectEditByAdmin = lazySingleton(
  () => new RejectEditByAdmin(placeEditRepository, rejectEdit),
);

export const listPendingEditsForPlace = lazySingleton(
  () => new ListPendingEditsForPlace(placeEditRepository),
);

export const listExpiredEditsQueue = lazySingleton(
  () => new ListExpiredEditsQueue(placeEditRepository),
);

export const listLevel2PendingEdits = lazySingleton(
  () => new ListLevel2PendingEdits(placeEditRepository),
);

export const expireOldEdits = lazySingleton(
  () => new ExpireOldEdits(placeEditRepository, sendEditOutcomeEmail),
);

export const getEditWithVotes = lazySingleton(() => new GetEditWithVotes(placeEditRepository));

export const listMyEdits = lazySingleton(() => new ListMyEdits(placeEditRepository));

// --- Providers exportados para uso direto em routes ---
// Nota: UserRepository agora é instanciado com cliente autenticado em cada route
export { mapProvider, storageProvider, adminStorageProvider };
