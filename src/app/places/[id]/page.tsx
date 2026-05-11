import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { Badge, PageContent } from '@/presentation/components/ui';
import { PageTitle } from '@/presentation/contexts/TopBarContext';
import { PlaceReviewList } from '@/presentation/components/reviews/PlaceReviewList';
import { PhotoUploadButton } from '@/presentation/components/places/PhotoUploadButton';
import { PlaceDetailHeader } from '@/presentation/components/places/PlaceDetailHeader';
import { PlaceInfo } from '@/presentation/components/places/PlaceInfo';
import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import { createServerSupabaseClient } from '@/presentation/lib/api-helpers';
import { SupabasePlaceRepository } from '@/infrastructure/database/supabase/SupabasePlaceRepository';
import { SupabaseReviewRepository } from '@/infrastructure/database/supabase/SupabaseReviewRepository';
import { GetPlaceById } from '@/application/use-cases/places/GetPlaceById';
import { GetPlaceReviews } from '@/application/use-cases/reviews/GetPlaceReviews';

interface Props {
  params: Promise<{ id: string }>;
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

    const [place, reviews] = await Promise.all([
      getPlaceById.execute(id),
      getPlaceReviews.execute(id, user?.id),
    ]);

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
      <div>
        <PageTitle title={place.name} />
        {/* Cover: Mapa da localização */}
        <PlaceDetailHeader lat={place.lat} lng={place.lng} name={place.name} placeId={place.id} />

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
            description={place.description}
            recommendPct={recommendPct}
            logoUrl={place.logoUrl}
          />

          {/* Badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="brand">{PRICE_BUCKET_LABELS[place.priceBucket]}</Badge>
            {place.periods.map((p) => (
              <Badge key={p}>{p}</Badge>
            ))}
          </div>

          {/* Botão para o criador adicionar/editar foto */}
          {isOwner && (
            <div className="mt-4">
              <PhotoUploadButton placeId={place.id} hasPhoto={!!place.logoUrl} />
            </div>
          )}

          <hr className="my-6 border-border" />

          {/* Seção de Avaliações */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Avaliações</h2>
            {canReview && (
              <Link
                href={`/places/${place.id}/review`}
                className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
              >
                Escrever avaliação
              </Link>
            )}
          </div>

          <PlaceReviewList
            reviews={serializedReviews}
            placeId={place.id}
            currentUserId={user?.id}
          />
        </PageContent>
      </div>
    );
  } catch (err) {
    if (err instanceof PlaceNotFoundError) notFound();
    throw err;
  }
}
