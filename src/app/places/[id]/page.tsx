import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { Badge } from '@/presentation/components/ui';
import { ReviewList } from '@/presentation/components/reviews/ReviewList';
import { PhotoUploadButton } from '@/presentation/components/places/PhotoUploadButton';
import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import { createRouteSupabaseClient } from '@/presentation/lib/api-helpers';
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
    const supabase = await createRouteSupabaseClient();
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
      getPlaceReviews.execute(id),
    ]);

    const isOwner = user?.id === place.createdBy;

    return (
      <main className="mx-auto max-w-2xl pb-24">
        {place.photoUrl && (
          <div className="relative h-56 w-full">
            <Image src={place.photoUrl} alt={place.name} fill className="object-cover" priority />
          </div>
        )}

        <div className="px-(--spacing-page-x) pt-5">
          <h1 className="text-2xl font-bold text-text-primary">{place.name}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {place.address}
            {place.bairro ? `, ${place.bairro}` : ''}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="brand">{PRICE_BUCKET_LABELS[place.priceBucket]}</Badge>
            {place.mealTypes.map((m) => (
              <Badge key={m}>{m}</Badge>
            ))}
            {place.cuisineTypes.map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
          </div>

          {place.reviewsCount > 0 && (
            <p className="mt-3 text-sm text-text-secondary">
              <span className="text-warning">★</span> {place.rating.toFixed(1)} ·{' '}
              {place.reviewsCount} avaliações
              {place.medianPrice && ` · Mediana R$${place.medianPrice.toFixed(2)}`}
            </p>
          )}

          {/* Botão para o criador adicionar/editar foto */}
          {isOwner && (
            <div className="mt-4">
              <PhotoUploadButton placeId={place.id} hasPhoto={!!place.photoUrl} />
            </div>
          )}

          <hr className="my-6 border-border" />
          <h2 className="mb-4 text-base font-semibold text-text-primary">Avaliações</h2>
          <ReviewList reviews={reviews} />
        </div>
      </main>
    );
  } catch (err) {
    if (err instanceof PlaceNotFoundError) notFound();
    throw err;
  }
}
