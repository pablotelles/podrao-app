'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MoreVertical, Star, UserCircle2 } from 'lucide-react';
import { ActionSheet } from '@/presentation/components/ui';
import { useRouter } from 'next/navigation';
import type { Review } from '@/domain/entities/Review';
import { REVIEW_COMMENT_MAX_CHARS, REVIEW_INITIAL_VISIBLE, REVIEW_PAGE_SIZE } from './reviewConfig';

type SerializedReview = Omit<Review, 'createdAt'> & { createdAt: string | Date };

function relativeDate(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Há 1 dia';
  if (days < 7) return `Há ${days} dias`;
  if (days < 14) return 'Há 1 semana';
  if (days < 30) return `Há ${Math.floor(days / 7)} semanas`;
  if (days < 60) return 'Há 1 mês';
  return `Há ${Math.floor(days / 30)} meses`;
}

function PlaceReviewItem({
  review,
  placeId,
  isOwnReview,
}: {
  review: SerializedReview;
  placeId: string;
  isOwnReview: boolean;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const nickname = isOwnReview ? 'Você' : (review.authorNickname ?? 'Avaliador');
  const initials = nickname.slice(0, 2).toUpperCase();
  const isTruncatable = !!review.comment && review.comment.length > REVIEW_COMMENT_MAX_CHARS;
  const displayedComment =
    isTruncatable && !expanded
      ? review.comment!.slice(0, REVIEW_COMMENT_MAX_CHARS).trimEnd() + '…'
      : review.comment;

  const handleDelete = async () => {
    setMenuOpen(false);
    const res = await fetch(`/api/places/${placeId}/reviews/${review.id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
  };

  const ownActions = [
    {
      icon: (
        <Link href={`/places/${placeId}/review`} className="contents">
          <Star size={16} />
        </Link>
      ),
      label: 'Editar avaliação',
      onClick: () => {
        router.push(`/places/${placeId}/review`);
        setMenuOpen(false);
      },
    },
    {
      icon: <span className="text-error">🗑️</span>,
      label: 'Excluir avaliação',
      variant: 'danger' as const,
      onClick: () => void handleDelete(),
    },
  ];

  const otherActions = [
    {
      icon: <span>🚩</span>,
      label: 'Denunciar',
      onClick: () => setMenuOpen(false),
    },
  ];

  return (
    <div className="py-3 border-b border-border last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar */}
          <div className="shrink-0 h-7 w-7 overflow-hidden rounded-full">
            {review.authorAvatarUrl ? (
              <Image
                src={review.authorAvatarUrl}
                alt={nickname}
                width={28}
                height={28}
                className="object-cover h-7 w-7"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand-subtle">
                {isOwnReview ? (
                  <UserCircle2 size={16} className="text-brand" />
                ) : (
                  <span className="text-[10px] font-semibold text-brand">{initials}</span>
                )}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <span className="text-sm font-semibold text-text-primary truncate block">
              {nickname}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < review.rating ? 'fill-warning text-warning' : 'text-border'}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-text-disabled">{relativeDate(review.createdAt)}</span>
          <button
            onClick={() => setMenuOpen(true)}
            className="shrink-0 text-text-disabled hover:text-text-secondary p-1"
            aria-label="Opções da avaliação"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {displayedComment && (
        <div className="mt-1.5">
          <p className="text-sm text-text-secondary">{displayedComment}</p>
          {isTruncatable && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-0.5 text-xs font-semibold text-brand"
            >
              {expanded ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
        </div>
      )}

      <ActionSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        actions={isOwnReview ? ownActions : otherActions}
      />
    </div>
  );
}

interface PlaceReviewListProps {
  reviews: SerializedReview[];
  placeId: string;
  currentUserId?: string;
}

export function PlaceReviewList({ reviews, placeId, currentUserId }: PlaceReviewListProps) {
  const [visibleCount, setVisibleCount] = useState(REVIEW_INITIAL_VISIBLE);

  if (!reviews.length) return null;

  const visible = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="pb-2">
        {visible.map((r) => (
          <PlaceReviewItem
            key={r.id}
            review={r}
            placeId={placeId}
            isOwnReview={!!currentUserId && r.userId === currentUserId}
          />
        ))}
      </div>

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
