'use client';

import Link from 'next/link';
import { ThumbsUp } from 'lucide-react';

interface PlaceDetailStickyReviewCTAProps {
  placeId: string;
}

export function PlaceDetailStickyReviewCTA({ placeId }: PlaceDetailStickyReviewCTAProps) {
  return (
    <div
      className="sticky bottom-0 border-t border-border bg-bg px-4 pb-5 pt-3"
      style={{ zIndex: 'var(--z-sticky)' }}
    >
      <Link
        href={`/places/${placeId}/review`}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 text-base font-medium text-text-inverse shadow-(--shadow-fab) transition-colors hover:bg-brand-hover"
      >
        <ThumbsUp className="h-4 w-4 shrink-0" />
        Escrever avaliação
      </Link>
    </div>
  );
}
