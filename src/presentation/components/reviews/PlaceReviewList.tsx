'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MoreVertical, Star, UserCircle2 } from 'lucide-react';
import { ActionSheet } from '@/presentation/components/ui';
import { useRouter } from 'next/navigation';
import { usePlaceReview } from '@/presentation/contexts/PlaceReviewContext';
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
  const { openReview } = usePlaceReview();
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
      icon: <Star size={16} />,
      label: 'Editar avaliação',
      onClick: () => {
        openReview(review.id);
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
    <div className="border-b border-border py-3 last:border-b-0">
      {/* Header: avatar + meta (nome + data) | stars + menu */}
      <div className="mb-1.5 flex items-center gap-2">
        {/* Avatar 32×32 */}
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
          {review.authorAvatarUrl ? (
            <Image
              src={review.authorAvatarUrl}
              alt={nickname}
              width={32}
              height={32}
              className="h-8 w-8 object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-subtle">
              {isOwnReview ? (
                <UserCircle2 size={16} className="text-brand" />
              ) : (
                <span className="text-[11px] font-bold text-brand">{initials}</span>
              )}
            </div>
          )}
        </div>

        {/* Meta: nome + data abaixo */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-text-primary">{nickname}</p>
          <p className="text-[11px] text-text-secondary">{relativeDate(review.createdAt)}</p>
        </div>

        {/* Stars + menu — direita */}
        <div className="flex shrink-0 items-center gap-1">
          <div className="flex gap-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                className={i < review.rating ? 'fill-warning text-warning' : 'text-border'}
              />
            ))}
          </div>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-1 text-text-disabled hover:text-text-secondary"
            aria-label="Opções da avaliação"
          >
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      {displayedComment && (
        <div>
          <p className="text-[15px] leading-relaxed text-text-primary">{displayedComment}</p>
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

  if (!reviews.length) {
    return (
      <div className="py-6 text-center">
        <p className="text-3xl">💬</p>
        <p className="mt-2 text-[15px] font-semibold text-text-primary">Ainda sem avaliações</p>
        <p className="mt-1 text-[13px] text-text-secondary">
          Seja a primeira pessoa a avaliar este lugar
        </p>
      </div>
    );
  }

  const visible = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <div className="flex flex-col">
      <div>
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
          className="mt-3 w-full rounded-full border border-border py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-subtle"
        >
          Ver mais avaliações ({reviews.length - visibleCount} restantes)
        </button>
      )}
    </div>
  );
}
