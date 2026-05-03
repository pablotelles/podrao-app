'use client';

import { useState } from 'react';
import { useZodForm } from '@/presentation/lib/forms/useZodForm';
import { submitReviewSchema, type SubmitReviewInput } from '@/presentation/lib/forms/review/schema';
import { submitReviewInitialValues } from '@/presentation/lib/forms/review/initialValues';
import { Button, Input, Textarea, ThumbToggle, ToggleGroup } from '@/presentation/components/ui';
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
  const mealType = watch('mealType');

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
        <ThumbToggle
          value={thumbsUp}
          onChange={(v) => setValue('thumbsUp', v)}
          error={errors.thumbsUp ? 'Selecione uma avaliação' : undefined}
        />
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
        <ToggleGroup
          mode="single"
          options={MEAL_TYPES}
          value={mealType}
          onChange={(v) => setValue('mealType', v)}
        />
      </div>

      <Textarea
        label="Comentário (opcional)"
        maxLength={500}
        helperText="Máximo 500 caracteres"
        error={errors.comment?.message}
        {...register('comment')}
      />

      {serverError && <p className="text-sm text-error">{serverError}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Enviando...' : 'Enviar avaliação'}
      </Button>
    </form>
  );
}
