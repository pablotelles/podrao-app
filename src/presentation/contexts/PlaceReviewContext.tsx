'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { ReviewSheet } from '@/presentation/components/review-flow/ReviewSheet';
import type { Place } from '@/domain/entities/Place';

interface PlaceReviewContextValue {
  openReview: (editReviewId?: string) => void;
}

const PlaceReviewContext = createContext<PlaceReviewContextValue | null>(null);

export function usePlaceReview() {
  const ctx = useContext(PlaceReviewContext);
  if (!ctx) throw new Error('usePlaceReview must be used within PlaceReviewController');
  return ctx;
}

interface PlaceReviewControllerProps {
  children: ReactNode;
  placeId: string;
  place: Place;
}

export function PlaceReviewController({ children, placeId, place }: PlaceReviewControllerProps) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [editReviewId, setEditReviewId] = useState<string | null>(null);

  const openReview = (editId?: string) => {
    setEditReviewId(editId ?? null);
    setReviewOpen(true);
  };

  return (
    <PlaceReviewContext.Provider value={{ openReview }}>
      {children}
      <ReviewSheet
        placeId={placeId}
        place={place}
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        editReviewId={editReviewId}
      />
    </PlaceReviewContext.Provider>
  );
}
