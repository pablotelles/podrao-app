'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import useSWR from 'swr';
import { Sheet, ProgressSteps, StarRating } from '@/presentation/components/ui';
import { StepMain } from './StepMain';
import { StepEnrichment } from './StepEnrichment';
import { submitReviewSchema } from '@/presentation/lib/forms/review/schema';
import type { ReviewScore } from '@/domain/entities/ReviewScore';
import type { Review } from '@/domain/entities/Review';
import type { Place } from '@/domain/entities/Place';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';

const STEP_LABELS = ['Avaliação', 'Detalhes'] as const;
const TOTAL_STEPS = STEP_LABELS.length;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ReviewSheetProps {
  placeId: string;
  place: Place;
  open: boolean;
  onClose: () => void;
  editReviewId?: string | null;
}

export function ReviewSheet({ placeId, place, open, onClose, editReviewId }: ReviewSheetProps) {
  const router = useRouter();

  const { data: existingReview } = useSWR<Review>(
    open && editReviewId ? `/api/places/${placeId}/reviews/${editReviewId}` : null,
    fetcher,
  );

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [rating, setRating] = useState<number | undefined>(undefined);
  const [priceBucket, setPriceBucket] = useState<PriceBucket | undefined>(undefined);
  const [scores, setScores] = useState<ReviewScore[]>([]);
  const [comment, setComment] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(0);
        setSubmitted(false);
        setError(null);
        setHydrated(false);
        setRating(undefined);
        setPriceBucket(undefined);
        setScores([]);
        setComment('');
        setPhotoUrls([]);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Pre-fill when editing
  useEffect(() => {
    if (existingReview && !hydrated) {
      setRating(existingReview.rating);
      setPriceBucket(existingReview.priceBucket);
      setScores(existingReview.scores ?? []);
      setComment(existingReview.comment ?? '');
      setPhotoUrls(existingReview.photos ?? []);
      setHydrated(true);
    }
  }, [existingReview, hydrated]);

  const handleSubmit = async () => {
    if (!rating) return;

    const data = {
      rating,
      priceBucket,
      scores: scores.length > 0 ? scores : undefined,
      comment: comment.trim() || undefined,
      photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
    };

    const validation = submitReviewSchema.safeParse(data);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Dados inválidos');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const url = editReviewId
        ? `/api/places/${placeId}/reviews/${editReviewId}`
        : `/api/places/${placeId}/reviews`;
      const method = editReviewId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error: string };
        throw new Error(body.error);
      }

      void mutate('/api/me/stats');
      void mutate('/api/me/reviews');
      void mutate(`/api/places/${placeId}/reviews`);
      void mutate(`/api/places/${placeId}`);
      router.refresh();
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const title = submitted
    ? 'Avaliação publicada!'
    : editReviewId
      ? 'Editar avaliação'
      : 'Avalie o lugar';

  return (
    <Sheet
      open={open}
      onClose={onClose}
      ariaLabel={title}
      header={
        <div className="px-(--spacing-page-x) py-3">
          {submitted ? (
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          ) : (
            <ProgressSteps currentStep={step} totalSteps={TOTAL_STEPS} labels={STEP_LABELS} />
          )}
        </div>
      }
      footer={
        submitted ? (
          <div className="px-(--spacing-page-x) pb-8 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-hover"
            >
              Fechar
            </button>
          </div>
        ) : (
          <div className="px-(--spacing-page-x) pb-8 pt-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => (step === 0 ? onClose() : setStep(0))}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border text-text-secondary transition-all hover:border-brand hover:text-brand"
                aria-label="Voltar"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M12.5 15L7.5 10L12.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => (step === 0 ? setStep(1) : void handleSubmit())}
                disabled={(step === 0 && rating === undefined) || submitting}
                className="flex-1 rounded-full bg-brand py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Publicando...' : step === 0 ? 'Continuar' : 'Publicar avaliação ✓'}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-error">{error}</p>}
          </div>
        )
      }
    >
      {submitted ? (
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <div className="flex h-18 w-18 items-center justify-center rounded-full bg-success-bg">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="2.5"
              aria-hidden
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[22px] font-bold tracking-tight text-text-primary">
              Valeu pela avaliação! 🎉
            </p>
            {rating && (
              <div className="mt-1 flex items-center justify-center gap-2">
                <StarRating value={rating} onChange={() => {}} readonly size="sm" />
                <span className="text-sm text-text-secondary">{rating} de 5</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {step === 0 && (
            <StepMain
              place={place}
              rating={rating}
              onRatingChange={setRating}
              priceBucket={priceBucket}
              onPriceBucketChange={setPriceBucket}
            />
          )}
          {step === 1 && (
            <StepEnrichment
              scores={scores}
              onScoresChange={setScores}
              comment={comment}
              onCommentChange={setComment}
              photoUrls={photoUrls}
              onPhotoUrlsChange={setPhotoUrls}
            />
          )}
        </>
      )}
    </Sheet>
  );
}
