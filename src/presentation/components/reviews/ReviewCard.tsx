'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Share2,
  Pencil,
  Trash2,
  Flag,
  UserCircle2,
} from 'lucide-react';
import { useReactionGroup } from '@/presentation/hooks/useReactionGroup';
import { StarRating } from '@/presentation/components/ui/StarRating';
import { Text } from '@/presentation/components/ui/Text';
import type { Review } from '@/domain/entities/Review';
import { REVIEW_COMMENT_MAX_CHARS } from './reviewConfig';
type SerializedReview = Omit<Review, 'createdAt'> & { createdAt: string | Date };

interface ReviewCardProps {
  review: SerializedReview;
  placeId: string;
  isOwnReview: boolean;
}

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

export function ReviewCard({ review, placeId, isOwnReview }: ReviewCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [commentExpanded, setCommentExpanded] = useState(false);

  const reaction = useReactionGroup({
    entityType: 'review',
    entityId: review.id,
    initialCounts: review.reactionCounts ?? {},
    initialActiveType: review.viewerReactionType ?? null,
  });

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/places/${placeId}/reviews/${review.id}`, {
        method: 'DELETE',
      });
      if (res.ok) router.refresh();
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/places/${placeId}`;
    if (navigator.share) {
      await navigator.share({ url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
            {review.authorAvatarUrl ? (
              <Image
                src={review.authorAvatarUrl}
                alt={review.authorNickname ?? ''}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand-subtle">
                <UserCircle2 className="h-6 w-6 text-brand" />
              </div>
            )}
          </div>
          <div>
            <Text as="span" variant="label">
              {isOwnReview ? 'Você' : (review.authorNickname ?? 'Avaliador')}
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Text as="span" variant="caption" textColor="secondary">
            {relativeDate(review.createdAt)}
          </Text>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-bg-subtle"
              aria-label="Mais opções"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0"
                  style={{ zIndex: 'var(--z-overlay)' }}
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-8 w-52 overflow-hidden rounded-xl border border-border bg-bg shadow-(--shadow-modal)"
                  style={{ zIndex: 'var(--z-modal)' }}
                >
                  {isOwnReview ? (
                    <>
                      <Link
                        href={`/places/${placeId}/review`}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-bg-subtle"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Pencil className="h-4 w-4 text-text-secondary" />
                        Editar avaliação
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          void handleDelete();
                        }}
                        disabled={deleting}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-error hover:bg-bg-subtle disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deleting ? 'Excluindo...' : 'Excluir avaliação'}
                      </button>
                    </>
                  ) : (
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-bg-subtle"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Flag className="h-4 w-4 text-text-secondary" />
                      Denunciar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="mt-3 flex items-center gap-2">
        <StarRating value={review.rating} onChange={() => {}} readonly size="sm" />
        <Text as="span" variant="label">
          {review.rating.toFixed(1).replace('.', ',')}
        </Text>
      </div>

      {/* Comentário */}
      {review.comment &&
        (() => {
          const isTruncatable = review.comment.length > REVIEW_COMMENT_MAX_CHARS;
          const displayed =
            isTruncatable && !commentExpanded
              ? review.comment.slice(0, REVIEW_COMMENT_MAX_CHARS).trimEnd() + '…'
              : review.comment;
          return (
            <div className="mt-2">
              <Text as="p" variant="body">
                {displayed}
              </Text>
              {isTruncatable && (
                <button onClick={() => setCommentExpanded((v) => !v)} className="mt-0.5">
                  <Text as="span" variant="label" textColor="brand">
                    {commentExpanded ? 'Ver menos' : 'Ver mais'}
                  </Text>
                </button>
              )}
            </div>
          );
        })()}

      {/* Fotos */}
      {review.photos && review.photos.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {review.photos.map((photo, idx) => (
            <div key={idx} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
              <Image src={photo} alt={`Foto ${idx + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Ações */}
      <div className="mt-3 flex items-center gap-2">
        {(
          [
            {
              type: 'useful',
              icon: (
                <ThumbsUp
                  className="h-4 w-4"
                  color={
                    reaction.activeType === 'useful'
                      ? 'var(--color-brand)'
                      : 'var(--color-text-secondary)'
                  }
                  fill={reaction.activeType === 'useful' ? 'var(--color-brand)' : 'none'}
                />
              ),
              activeColor: 'var(--color-brand)',
            },
            {
              type: 'partial',
              icon: (
                <Meh
                  className="h-4 w-4"
                  color={
                    reaction.activeType === 'partial'
                      ? 'var(--color-warning)'
                      : 'var(--color-text-secondary)'
                  }
                />
              ),
              activeColor: 'var(--color-warning)',
            },
            {
              type: 'not_useful',
              icon: (
                <ThumbsDown
                  className="h-4 w-4"
                  color={
                    reaction.activeType === 'not_useful'
                      ? 'var(--color-error)'
                      : 'var(--color-text-secondary)'
                  }
                  fill={reaction.activeType === 'not_useful' ? 'var(--color-error)' : 'none'}
                />
              ),
              activeColor: 'var(--color-error)',
            },
          ] as const
        ).map(({ type, icon, activeColor }) => {
          const count = reaction.counts[type] ?? 0;
          const isActive = reaction.activeType === type;
          return (
            <button
              key={type}
              onClick={() => reaction.toggle(type)}
              disabled={reaction.loading}
              aria-label={type}
              className="flex items-center gap-1 rounded-full px-2 py-1.5 transition-colors hover:bg-bg-subtle disabled:opacity-50"
            >
              {icon}
              {count > 0 && (
                <Text
                  as="span"
                  variant="caption"
                  style={{ color: isActive ? activeColor : 'var(--color-text-secondary)' }}
                >
                  {count}
                </Text>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
