import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/presentation/lib/api-helpers';
import {
  getPlaceBySlug,
  getPlaceReviews,
  listPendingEditsForPlace,
  getPlaceVisitStats,
} from '@/presentation/lib/container';
import { buildPlaceMetadata } from '@/presentation/lib/seo';
import { PageContent } from '@/presentation/components/ui';
import { PlaceReviewList } from '@/presentation/components/reviews/PlaceReviewList';
import { PlaceDetailHeader } from '@/presentation/components/places/PlaceDetailHeader';
import { PlaceInfo } from '@/presentation/components/places/PlaceInfo';
import { PlaceAttributes } from '@/presentation/components/places/PlaceAttributes';
import { PlaceEditActions } from '@/presentation/components/places/PlaceEditActions';
import { PlaceActionsFAB } from '@/presentation/components/places/PlaceActionsFAB';
import { PlaceVisitorsCount } from '@/presentation/components/places/PlaceVisitorsCount';

interface Props {
  params: Promise<{ slug: string }>;
}

const fetchPlace = cache(async (slug: string) => getPlaceBySlug.execute(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const place = await fetchPlace(slug);
  if (!place) return {};
  return buildPlaceMetadata(place);
}

export default async function PlaceBySlugPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const place = await fetchPlace(slug);
  if (!place) notFound();

  const [reviews, pendingEdits, visitStats] = await Promise.all([
    getPlaceReviews.execute(place.id, user?.id),
    listPendingEditsForPlace.execute({ placeId: place.id, viewerUserId: user?.id }),
    getPlaceVisitStats.execute({ placeId: place.id, userId: user?.id }),
  ]);

  const pendingEditsByField = Object.fromEntries(
    pendingEdits.map((e) => [e.fieldName, { id: e.id }]),
  );

  const serializedReviews = reviews.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  const isOwner = user?.id === place.createdBy;
  const userReviewCount = user ? reviews.filter((r) => r.userId === user.id).length : 0;
  const canReview = user && userReviewCount < 1 + visitStats.viewerVisitCount;

  const recommendPct =
    reviews.length > 0
      ? Math.round((reviews.filter((r) => r.rating >= 3.8).length / reviews.length) * 100)
      : undefined;

  const placeData = {
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
  };

  return (
    <div>
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

        <div className="mb-2">
          <h2 className="text-base font-semibold text-text-primary">
            Avaliações
            {reviews.length > 0 && (
              <span className="font-normal text-text-secondary"> · {reviews.length}</span>
            )}
          </h2>
        </div>

        {visitStats.distinctVisitors > 0 && (
          <div className="mb-4">
            <PlaceVisitorsCount count={visitStats.distinctVisitors} />
          </div>
        )}

        <PlaceReviewList
          reviews={serializedReviews}
          placeId={place.id}
          placeSlug={place.slug}
          currentUserId={user?.id}
        />
      </PageContent>

      <PlaceActionsFAB
        placeId={place.id}
        slug={place.slug}
        isApproved={place.status === 'approved'}
        canReview={!!canReview}
        initialVisitCount={visitStats.viewerVisitCount}
        initialVisitedToday={visitStats.viewerVisitedToday}
        place={placeData}
        pendingEditsByField={pendingEditsByField}
      />
    </div>
  );
}
