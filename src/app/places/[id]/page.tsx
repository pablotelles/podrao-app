import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { Badge } from '@/presentation/components/ui';
import { ReviewList } from '@/presentation/components/reviews/ReviewList';
import { PhotoUploadButton } from '@/presentation/components/places/PhotoUploadButton';
import { PlaceDetailHeader } from '@/presentation/components/places/PlaceDetailHeader';
import { FavoriteButton } from '@/presentation/components/favorites/FavoriteButton';
import { AddToListButton } from '@/presentation/components/lists/AddToListButton';
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
      getPlaceReviews.execute(id),
    ]);

    const isOwner = user?.id === place.createdBy;

    return (
      <main className="mx-auto max-w-2xl pb-24">
        {/* Cover: Mapa da localização */}
        <PlaceDetailHeader lat={place.lat} lng={place.lng} name={place.name} />

        <div className="px-(--spacing-page-x) pt-5">
          {/* Header: Logo + Info */}
          <div className="flex gap-4">
            {/* Logo menor */}
            {place.logoUrl && (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
                <Image src={place.logoUrl} alt={place.name} fill className="object-cover" />
              </div>
            )}

            {/* Info ao lado do logo */}
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold text-text-primary leading-tight">{place.name}</h1>
                {place.status === 'approved' && (
                  <svg
                    className="h-5 w-5 text-brand"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-label="Verificado"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="mt-0.5 text-sm text-text-secondary leading-snug">
                {place.address}, {place.numero}
                {place.complemento && ` - ${place.complemento}`}
                {place.bairro && ` · ${place.bairro}`} · {place.cidade}, {place.estado}
              </p>
              <p className="mt-1 text-xs text-text-secondary">{place.establishmentType}</p>
              {place.reviewsCount > 0 && (
                <p className="mt-1 text-xs text-text-secondary">
                  <span className="text-warning">★</span> {place.rating.toFixed(1)} ·{' '}
                  {place.reviewsCount} avaliações
                  {place.medianPrice && ` · Mediana R$${place.medianPrice.toFixed(2)}`}
                </p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="brand">{PRICE_BUCKET_LABELS[place.priceBucket]}</Badge>
            {place.mealTypes.map((m) => (
              <Badge key={m}>{m}</Badge>
            ))}
            {place.cuisineTypes.map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
          </div>

          {/* Ações: Favoritar e Adicionar a Lista */}
          {user && (
            <div className="mt-4 flex gap-2">
              <FavoriteButton placeId={place.id} />
              <AddToListButton placeId={place.id} />
            </div>
          )}

          {/* Botão para o criador adicionar/editar foto */}
          {isOwner && (
            <div className="mt-4">
              <PhotoUploadButton placeId={place.id} hasPhoto={!!place.logoUrl} />
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
