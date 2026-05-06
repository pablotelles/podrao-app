'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mutate } from 'swr';
import useSWR from 'swr';
import { PageContent, ProgressSteps, Button } from '@/presentation/components/ui';
import { usePageTitle } from '@/presentation/contexts/TopBarContext';
import { SubHeaderPortal } from '@/presentation/components/navigation/SubHeaderPortal';
import { useSubHeaderHeight } from '@/presentation/hooks/useSubHeaderHeight';
import { StepRating } from '@/presentation/components/review-flow/StepRating';
import { StepCategories } from '@/presentation/components/review-flow/StepCategories';
import { StepComment } from '@/presentation/components/review-flow/StepComment';
import { StepPhotos } from '@/presentation/components/review-flow/StepPhotos';
import { StepReview } from '@/presentation/components/review-flow/StepReview';
import { StepSuccess } from '@/presentation/components/review-flow/StepSuccess';
import { submitReviewSchema, type SubmitReviewInput } from '@/presentation/lib/forms/review/schema';
import type { ReviewScore } from '@/domain/entities/ReviewScore';
import type { MealType } from '@/domain/value-objects/MealType';
import type { Place } from '@/domain/entities/Place';

const STEPS = ['Nota geral', 'Detalhes', 'Comentário', 'Fotos', 'Revisão'] as const;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const placeId = params.id as string;

  // Buscar dados do lugar
  const { data: place } = useSWR<Place>(`/api/places/${placeId}`, fetcher);

  const [step, setStep] = useState(0);
  usePageTitle(STEPS[step] ?? 'Avaliação');
  useSubHeaderHeight();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado do formulário
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [scores, setScores] = useState<ReviewScore[]>([]);
  const [comment, setComment] = useState('');
  const [mealType, setMealType] = useState<MealType | undefined>(undefined);
  const [amountPaidPerPerson, setAmountPaidPerPerson] = useState<number | undefined>(undefined);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const canContinue = () => {
    if (step === 0) return rating !== undefined && rating >= 1 && rating <= 5;
    // Outros steps são opcionais
    return true;
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Último step: submeter
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!rating) return;

    const data: SubmitReviewInput = {
      rating,
      scores: scores.length > 0 ? scores : undefined,
      photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
      comment: comment.trim() || undefined,
      mealType,
      amountPaidPerPerson,
    };

    // Validar com Zod
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

      // Revalidar dados
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

  const handleSuccess = () => {
    router.push(`/places/${placeId}`);
  };

  // Se já enviou, mostrar step de sucesso
  if (submitted) {
    return (
      <div>
        <PageContent centered>
          <StepSuccess points={10} onContinue={handleSuccess} />
        </PageContent>
      </div>
    );
  }

  const formData: Partial<SubmitReviewInput> = {
    rating,
    scores,
    photoUrls,
    comment,
    mealType,
    amountPaidPerPerson,
  };

  return (
    <div>
      <SubHeaderPortal>
        <div className="bg-bg px-(--spacing-page-x) py-3">
          <ProgressSteps currentStep={step} totalSteps={STEPS.length} labels={STEPS} />
        </div>
      </SubHeaderPortal>
      <PageContent className="mx-auto w-full max-w-lg pb-28">
        {step === 0 && (
          <StepRating
            value={rating}
            onChange={setRating}
            error={!rating && error ? 'Selecione uma nota de 1 a 5' : undefined}
          />
        )}

        {step === 1 && <StepCategories scores={scores} onChange={setScores} />}

        {step === 2 && (
          <StepComment
            comment={comment}
            onCommentChange={setComment}
            mealType={mealType}
            onMealTypeChange={setMealType}
            amountPaidPerPerson={amountPaidPerPerson}
            onAmountPaidChange={setAmountPaidPerPerson}
          />
        )}

        {step === 3 && <StepPhotos photoUrls={photoUrls} onPhotosChange={setPhotoUrls} />}

        {step === 4 && <StepReview data={formData} placeName={place?.name} />}

        {error && step === 4 && <p className="mt-4 text-sm text-error">{error}</p>}
      </PageContent>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-bg px-(--spacing-page-x) py-4">
        <div className="mx-auto max-w-lg">
          <Button onClick={handleNext} disabled={!canContinue() || submitting} className="w-full">
            {submitting
              ? 'Enviando...'
              : step === STEPS.length - 1
                ? 'Publicar avaliação'
                : 'Continuar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
