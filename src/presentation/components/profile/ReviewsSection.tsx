'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Star } from 'lucide-react';
import { Skeleton, ActionSheet } from '@/presentation/components/ui';
import { useMyReviews, type MyReview } from '@/presentation/hooks/useMyReviews';
import { useToast } from '@/presentation/hooks/useToast';
import { DeleteReviewSheet } from './DeleteReviewSheet';
import { SectionShell } from './SectionShell';

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function ReviewItemWithDelete({ review, onDeleted }: { review: MyReview; onDeleted: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="py-3 border-b border-border last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link
            href={review.placeSlug ? `/p/${review.placeSlug}` : `/places/${review.placeId}`}
            className="text-sm font-semibold text-brand hover:underline truncate block"
          >
            {review.placeName}
          </Link>
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < review.rating ? 'fill-warning text-warning' : 'text-border'}
              />
            ))}
          </div>
          {review.comment && (
            <p className="mt-1 text-sm text-text-secondary line-clamp-2">{review.comment}</p>
          )}
          <p className="mt-1 text-xs text-text-disabled">{formatDate(review.createdAt)}</p>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="shrink-0 text-text-disabled hover:text-text-secondary p-1"
          aria-label="Opções da avaliação"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      <ActionSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        actions={[
          {
            icon: <Star size={16} />,
            label: 'Editar — Em breve',
            onClick: () => {
              showToast({ type: 'info', title: 'Em breve — disponível na próxima versão' });
            },
          },
          {
            icon: <span className="text-error">🗑️</span>,
            label: 'Excluir avaliação',
            variant: 'danger',
            onClick: () => setDeleteOpen(true),
          },
        ]}
      />

      <DeleteReviewSheet
        reviewId={review.id}
        placeId={review.placeId}
        placeName={review.placeName}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={onDeleted}
      />
    </div>
  );
}

export function ReviewsSection() {
  const { reviews, isLoading, mutate } = useMyReviews();

  if (!isLoading && reviews.length === 0) return null;

  return (
    <SectionShell title="Avaliações">
      {isLoading ? (
        <div className="flex flex-col gap-3 pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-3 border-b border-border">
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-3 w-1/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="pb-2">
          {reviews.map((review) => (
            <ReviewItemWithDelete key={review.id} review={review} onDeleted={() => void mutate()} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}
