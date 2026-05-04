'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { useZodForm } from '@/presentation/lib/forms/useZodForm';
import { submitReviewSchema, type SubmitReviewInput } from '@/presentation/lib/forms/review/schema';
import { submitReviewInitialValues } from '@/presentation/lib/forms/review/initialValues';
import { Button, Input, Textarea, StarRating, ToggleGroup } from '@/presentation/components/ui';
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

  const rating = watch('rating');
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
      // Revalidar stats do usuário
      mutate('/api/me/stats');
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
        <p className="mb-2 text-sm font-medium text-text-primary">Como foi sua experiência?</p>
        <StarRating
          value={rating ?? 0}
          onChange={(v) => setValue('rating', v)}
          size="lg"
          error={errors.rating ? 'Selecione uma nota de 1 a 5' : undefined}
        />
      </div>

      <Input
        label="Quanto você gastou por pessoa? (R$)"
        type="number"
        step="0.01"
        min="0.01"
        max="1999"
        placeholder="Ex: 32.50"
        error={errors.amountPaidPerPerson?.message}
        {...register('amountPaidPerPerson', { valueAsNumber: true })}
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
