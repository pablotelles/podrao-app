'use client';

import { useState } from 'react';
import { useZodForm } from '@/presentation/lib/forms/useZodForm';
import { submitReviewSchema, type SubmitReviewInput } from '@/presentation/lib/forms/review/schema';
import { submitReviewInitialValues } from '@/presentation/lib/forms/review/initialValues';
import { Button, Input } from '@/presentation/components/ui';
import { MEAL_TYPES } from '@/domain/value-objects/MealType';

interface ReviewFormProps {
  placeId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ placeId, onSuccess }: ReviewFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useZodForm<SubmitReviewInput>({
    schema: submitReviewSchema,
    defaultValues: submitReviewInitialValues,
  });

  const thumbsUp = watch('thumbsUp');

  async function onSubmit(data: SubmitReviewInput) {
    setSubmitting(true);
    setServerError(null);
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
      onSuccess?.();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-text-primary">Sua avaliação</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setValue('thumbsUp', true)}
            className={[
              'flex h-12 w-12 items-center justify-center rounded-full text-2xl border-2 transition-colors',
              thumbsUp === true ? 'border-success bg-green-50' : 'border-border',
            ].join(' ')}
            aria-label="Recomendo"
          >
            👍
          </button>
          <button
            type="button"
            onClick={() => setValue('thumbsUp', false)}
            className={[
              'flex h-12 w-12 items-center justify-center rounded-full text-2xl border-2 transition-colors',
              thumbsUp === false ? 'border-error bg-red-50' : 'border-border',
            ].join(' ')}
            aria-label="Não recomendo"
          >
            👎
          </button>
        </div>
        {errors.thumbsUp && <p className="mt-1 text-xs text-error">Selecione uma avaliação</p>}
      </div>

      <Input
        label="Quanto você pagou? (R$)"
        type="number"
        step="0.01"
        min="0"
        placeholder="Ex: 32.50"
        error={errors.amountPaid?.message}
        {...register('amountPaid', { valueAsNumber: true })}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-text-primary">Tipo de refeição</p>
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((m) => (
            <label key={m} className="cursor-pointer">
              <input type="radio" value={m} className="sr-only" {...register('mealType')} />
              <span className="rounded-full border border-border px-3 py-1 text-sm text-text-secondary">
                {m}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-primary">Comentário (opcional)</label>
        <textarea
          rows={3}
          maxLength={500}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          {...register('comment')}
        />
      </div>

      {serverError && <p className="text-sm text-error">{serverError}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Enviando...' : 'Enviar avaliação'}
      </Button>
    </form>
  );
}
