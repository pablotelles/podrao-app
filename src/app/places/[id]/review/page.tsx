'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mutate } from 'swr';
import useSWR from 'swr';
import { PageContent, ProgressSteps, StarRating } from '@/presentation/components/ui';
import { usePageTitle } from '@/presentation/contexts/TopBarContext';
import { SubHeaderPortal } from '@/presentation/components/navigation/SubHeaderPortal';
import { useSubHeaderHeight } from '@/presentation/hooks/useSubHeaderHeight';
import { StepMain } from '@/presentation/components/review-flow/StepMain';
import { StepEnrichment } from '@/presentation/components/review-flow/StepEnrichment';
import { submitReviewSchema } from '@/presentation/lib/forms/review/schema';
import type { ReviewScore } from '@/domain/entities/ReviewScore';
import type { Place } from '@/domain/entities/Place';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';

const STEP_LABELS = ['Avaliação', 'Detalhes'] as const;
const TOTAL_STEPS = STEP_LABELS.length;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const placeId = params.id as string;

  const { data: place } = useSWR<Place>(`/api/places/${placeId}`, fetcher);

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [priceBucket, setPriceBucket] = useState<PriceBucket | undefined>(undefined);
  const [scores, setScores] = useState<ReviewScore[]>([]);
  const [comment, setComment] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  usePageTitle(submitted ? 'Avaliação publicada!' : 'Avalie o lugar');
  useSubHeaderHeight();

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
      const res = await fetch(`/api/places/${placeId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error: string };
        throw new Error(body.error);
      }

      mutate('/api/me/stats');
      mutate(`/api/places/${placeId}/reviews`);
      mutate(`/api/places/${placeId}`);

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else {
      void handleSubmit();
    }
  };

  const handleBack = () => {
    if (step === 0) {
      router.back();
    } else {
      setStep(0);
    }
  };

  // Success screen
  if (submitted) {
    const addressLine = [place?.address, place?.cidade, place?.estado].filter(Boolean).join(', ');
    return (
      <PageContent
        centered
        className="flex flex-col items-center gap-6 px-(--spacing-page-x) py-12 text-center"
      >
        {/* Check icon */}
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
          <h1 className="text-[22px] font-bold tracking-tight text-text-primary">
            Valeu pela avaliação! 🎉
          </h1>
          {rating && (
            <div className="flex items-center justify-center gap-2 mt-1">
              <StarRating value={rating} onChange={() => {}} readonly size="sm" />
              <span className="text-sm text-text-secondary">{rating} de 5</span>
            </div>
          )}
        </div>

        {place && (
          <div className="flex w-full items-center gap-3 rounded-md bg-bg-subtle px-4 py-3.5 text-left">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-text-primary">{place.name}</p>
              <p className="truncate text-[13px] text-text-secondary">{addressLine}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push(`/places/${placeId}`)}
          className="w-full rounded-full bg-brand py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Ver o lugar
        </button>
      </PageContent>
    );
  }

  return (
    <div>
      <SubHeaderPortal>
        <div className="bg-bg px-(--spacing-page-x) py-3">
          <ProgressSteps currentStep={step} totalSteps={TOTAL_STEPS} labels={STEP_LABELS} />
        </div>
      </SubHeaderPortal>

      <PageContent className="mx-auto w-full max-w-lg pb-36">
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

        {error && <p className="mt-4 text-sm text-error">{error}</p>}
      </PageContent>

      {/* Bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t border-border bg-bg px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0))]"
        style={{ zIndex: 'var(--z-sticky)' }}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
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
            onClick={handleNext}
            disabled={(step === 0 && rating === undefined) || submitting}
            className="flex-1 rounded-full bg-brand py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Publicando...' : step === 0 ? 'Continuar' : 'Publicar avaliação ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}
