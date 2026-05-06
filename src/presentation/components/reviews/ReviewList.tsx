'use client';

import type { Review } from '@/domain/entities/Review';
import { EmptyState } from '@/presentation/components/ui';
import { ReviewCard } from './ReviewCard';

type SerializedReview = Omit<Review, 'createdAt'> & { createdAt: string | Date };

interface ReviewListProps {
  reviews: SerializedReview[];
  placeId: string;
  currentUserId?: string;
}

export function ReviewList({ reviews, placeId, currentUserId }: ReviewListProps) {
  if (!reviews.length) {
    return (
      <EmptyState
        icon="💬"
        title="Nenhuma avaliação ainda"
        description="Seja o primeiro a avaliar este lugar!"
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((r) => (
        <li key={r.id}>
          <ReviewCard
            review={r}
            placeId={placeId}
            isOwnReview={!!currentUserId && r.userId === currentUserId}
          />
        </li>
      ))}
    </ul>
  );
}
