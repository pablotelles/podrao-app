import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/presentation/lib/api-helpers';
import {
  getPlaceBySlug,
  getPlaceReviews,
  listPendingEditsForPlace,
} from '@/presentation/lib/container';
import { buildPlaceMetadata } from '@/presentation/lib/seo';
import { PageContent } from '@/presentation/components/ui';
import { PageTitle } from '@/presentation/contexts/TopBarContext';
import { PlaceReviewList } from '@/presentation/components/reviews/PlaceReviewList';
import { PlaceDetailHeader } from '@/presentation/components/places/PlaceDetailHeader';
import { PlaceInfo } from '@/presentation/components/places/PlaceInfo';
import { PlaceAttributes } from '@/presentation/components/places/PlaceAttributes';
import { PlaceDetailStickyReviewCTA } from '@/presentation/components/places/PlaceDetailStickyReviewCTA';
import { PlaceSuggestEditButton } from '@/presentation/components/places/PlaceSuggestEditButton';

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

  const [reviews, pendingEdits] = await Promise.all([
    getPlaceReviews.execute(place.id, user?.id),
    listPendingEditsForPlace.execute({ placeId: place.id, viewerUserId: user?.id }),
  ]);

  const pendingEditsByField = Object.fromEntries(
    pendingEdits.map((e) => [e.fieldName, { id: e.id }]),
  );

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
          pendingEditsByField={pendingEditsByField}
        />

        <PlaceAttributes
          place={place}
          description={place.description}
          pendingEditsByField={pendingEditsByField}
        />

        <div className="mt-4 flex justify-end">
          <PlaceSuggestEditButton />
        </div>

        <hr className="my-6 border-border" />

        <div className="mb-4">
          <h2 className="text-base font-semibold text-text-primary">
            Avaliações
            {reviews.length > 0 && (
              <span className="font-normal text-text-secondary"> · {reviews.length}</span>
            )}
          </h2>
        </div>

        <PlaceReviewList reviews={serializedReviews} placeId={place.id} currentUserId={user?.id} />
      </PageContent>

      {canReview && <PlaceDetailStickyReviewCTA placeId={place.id} />}
    </div>
  );
}
