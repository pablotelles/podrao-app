import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { PageContent } from '@/presentation/components/ui';
import { PageTitle } from '@/presentation/contexts/TopBarContext';
import { PlaceReviewList } from '@/presentation/components/reviews/PlaceReviewList';
import { PlaceDetailHeader } from '@/presentation/components/places/PlaceDetailHeader';
import { PlaceInfo } from '@/presentation/components/places/PlaceInfo';
import { PlaceAttributes } from '@/presentation/components/places/PlaceAttributes';
import { PlaceDetailStickyReviewCTA } from '@/presentation/components/places/PlaceDetailStickyReviewCTA';
import { createServerSupabaseClient } from '@/presentation/lib/api-helpers';
import { SupabasePlaceRepository } from '@/infrastructure/database/supabase/SupabasePlaceRepository';
import { SupabaseReviewRepository } from '@/infrastructure/database/supabase/SupabaseReviewRepository';
import { GetPlaceById } from '@/application/use-cases/places/GetPlaceById';
import { GetPlaceReviews } from '@/application/use-cases/reviews/GetPlaceReviews';
import { buildPlaceMetadata } from '@/presentation/lib/seo';
import { listPendingEditsForPlace } from '@/presentation/lib/container';
import { PlaceEditActions } from '@/presentation/components/places/PlaceEditActions';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const supabase = await createServerSupabaseClient();
    const repo = new SupabasePlaceRepository(supabase);
    const useCase = new GetPlaceById(repo);
    const place = await useCase.execute(id);
    return buildPlaceMetadata(place);
  } catch {
    return {};
  }
}

export default async function PlaceDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    // Usar client autenticado para que RLS policies funcionem corretamente
    const supabase = await createServerSupabaseClient();
    const placeRepository = new SupabasePlaceRepository(supabase);
    const reviewRepository = new SupabaseReviewRepository(supabase);

    const getPlaceById = new GetPlaceById(placeRepository);
    const getPlaceReviews = new GetPlaceReviews(reviewRepository, placeRepository);

    // Pegar dados do usuário logado (se houver)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const place = await getPlaceById.execute(id);

    // Redirect to canonical SEO URL when slug is available
    if (place.slug) {
      permanentRedirect(`/p/${place.slug}`);
    }

    const [reviews, pendingEdits] = await Promise.all([
      getPlaceReviews.execute(id, user?.id),
      listPendingEditsForPlace.execute({ placeId: id, viewerUserId: user?.id }),
    ]);

    const pendingEditsByField = Object.fromEntries(
      pendingEdits.map((e) => [e.fieldName, { id: e.id }]),
    );

    // Serialize reviews for Client Component (convert Date to string)
    const serializedReviews = reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));

    const isOwner = user?.id === place.createdBy;
    const userReview = user ? reviews.find((r) => r.userId === user.id) : null;
    const canReview = user && !userReview;

    const recommendPct =
      reviews.length > 0
        ? Math.round((reviews.filter((r) => r.rating >= 3.8).length / reviews.length) * 100)
        : undefined;

    return (
      <div className="pb-20">
        <PageTitle title={place.name} />
        {/* Cover: Mapa da localização */}
        <PlaceDetailHeader
          lat={place.lat}
          lng={place.lng}
          name={place.name}
          placeId={place.id}
          slug={place.slug}
        />

        <PageContent centered>
          <PlaceInfo
            name={place.name}
            status={place.status}
            address={place.address}
            numero={place.numero}
            complemento={place.complemento}
            bairro={place.bairro}
            cidade={place.cidade}
            estado={place.estado}
            establishmentType={place.establishmentType}
            reviewsCount={place.reviewsCount}
            rating={place.rating}
            recommendPct={recommendPct}
            logoUrl={place.logoUrl}
            isOwner={isOwner}
            placeId={place.id}
          />

          {/* Atributos contextuais por tipo de estabelecimento + descrição */}
          <PlaceAttributes
            place={place}
            description={place.description}
            pendingBanner={
              <PlaceEditActions
                place={{
                  id: place.id,
                  name: place.name,
                  address: place.address,
                  numero: place.numero,
                  bairro: place.bairro,
                  cidade: place.cidade,
                  estado: place.estado,
                  establishmentType: place.establishmentType,
                  priceBucket: place.priceBucket,
                  description: place.description,
                  attributes: place.attributes,
                  periods: place.periods,
                }}
                pendingEditsByField={pendingEditsByField}
              />
            }
          />

          <hr className="my-6 border-border" />

          {/* Seção de Avaliações */}
          <div className="mb-4">
            <h2 className="text-base font-semibold text-text-primary">
              Avaliações
              {reviews.length > 0 && (
                <span className="font-normal text-text-secondary"> · {reviews.length}</span>
              )}
            </h2>
          </div>

          <PlaceReviewList
            reviews={serializedReviews}
            placeId={place.id}
            currentUserId={user?.id}
          />
        </PageContent>

        {/* CTA sticky de avaliação — visível apenas para usuários autenticados que ainda não avaliaram */}
        {canReview && <PlaceDetailStickyReviewCTA placeId={place.id} />}
      </div>
    );
  } catch (err) {
    if (err instanceof PlaceNotFoundError) notFound();
    throw err;
  }
}
