'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { useZodForm } from '@/presentation/lib/forms/useZodForm';
import { submitReviewSchema, type SubmitReviewInput } from '@/presentation/lib/forms/review/schema';
import { submitReviewInitialValues } from '@/presentation/lib/forms/review/initialValues';
import { Button, Textarea, StarRating } from '@/presentation/components/ui';
import { useToast } from '@/presentation/hooks/useToast';

interface ReviewFormProps {
  placeId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ placeId, onSuccess }: ReviewFormProps) {
  const { showToast } = useToast();
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
      mutate('/api/me/stats');
      showToast({
        type: 'success',
        title: 'Avaliação enviada',
        message: 'Obrigado por compartilhar!',
      });
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar avaliação';
      setServerError(msg);
      showToast({ type: 'error', title: 'Erro ao enviar avaliação', message: msg });
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

      <Textarea
        label="Comentário (opcional)"
        maxLength={1500}
        helperText="Máximo 1500 caracteres"
        error={errors.comment?.message}
        {...register('comment')}
      />

      {serverError && <p className="text-sm text-error">{serverError}</p>}

      <Button type="submit" isLoading={submitting} loadingText="Enviando...">
        Enviar avaliação
      </Button>
    </form>
  );
}
