'use client';

import { Fragment, useState } from 'react';
import type { Review } from '@/domain/entities/Review';
import { Card, EmptyState } from '@/presentation/components/ui';
import { ReviewCard } from './ReviewCard';
import { REVIEW_INITIAL_VISIBLE, REVIEW_PAGE_SIZE } from './reviewConfig';

type SerializedReview = Omit<Review, 'createdAt'> & { createdAt: string | Date };

interface ReviewListProps {
  reviews: SerializedReview[];
  placeId: string;
  currentUserId?: string;
}

export function ReviewList({ reviews, placeId, currentUserId }: ReviewListProps) {
  const [visibleCount, setVisibleCount] = useState(REVIEW_INITIAL_VISIBLE);

  if (!reviews.length) {
    return (
      <EmptyState
        icon="💬"
        title="Nenhuma avaliação ainda"
        description="Seja o primeiro a avaliar este lugar!"
      />
    );
  }

  const visible = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <div className="flex flex-col gap-3">
      <Card noPadding className="overflow-hidden">
        {visible.map((r, i) => (
          <Fragment key={r.id}>
            {i > 0 && <hr className="border-border mx-4" />}
            <ReviewCard
              review={r}
              placeId={placeId}
              isOwnReview={!!currentUserId && r.userId === currentUserId}
            />
          </Fragment>
        ))}
      </Card>

      {hasMore && (
        <button
          onClick={() => setVisibleCount((v) => v + REVIEW_PAGE_SIZE)}
          className="w-full rounded-full border border-border py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-subtle"
        >
          Ver mais avaliações ({reviews.length - visibleCount} restantes)
        </button>
      )}
    </div>
  );
}
