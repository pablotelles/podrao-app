'use client';

import Link from 'next/link';
import { ThumbsUp } from 'lucide-react';
import { PlaceCheckInButton } from './PlaceCheckInButton';

interface PlaceDetailStickyReviewCTAProps {
  placeId: string;
  canReview: boolean;
  checkIn?: {
    initialVisitCount: number;
    initialVisitedToday: boolean;
  };
}

export function PlaceDetailStickyReviewCTA({
  placeId,
  canReview,
  checkIn,
}: PlaceDetailStickyReviewCTAProps) {
  return (
    <div
      className="sticky bottom-16 flex flex-col gap-2 border-t border-border bg-bg px-4 pb-5 pt-3"
      style={{ zIndex: 'var(--z-sticky)' }}
    >
      {canReview && (
        <Link
          href={`/places/${placeId}/review`}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 text-base font-medium text-text-inverse shadow-(--shadow-fab) transition-colors hover:bg-brand-hover"
        >
          <ThumbsUp className="h-4 w-4 shrink-0" />
          Escrever avaliação
        </Link>
      )}
      {checkIn && (
        <PlaceCheckInButton
          placeId={placeId}
          initialVisitCount={checkIn.initialVisitCount}
          initialVisitedToday={checkIn.initialVisitedToday}
        />
      )}
    </div>
  );
}
