'use client';

import { Textarea, Input } from '@/presentation/components/ui';

interface StepCommentProps {
  comment: string;
  onCommentChange: (value: string) => void;
  amountPaidPerPerson?: number;
  onAmountPaidChange: (value: number | undefined) => void;
  errors?: {
    comment?: string;
    amountPaidPerPerson?: string;
  };
}

export function StepComment({
  comment,
  onCommentChange,
  amountPaidPerPerson,
  onAmountPaidChange,
  errors,
}: StepCommentProps) {
  return (
    <div className="py-4">
      <h2 className="mb-2 text-xl font-bold text-text-primary">
        Conte mais sobre sua experiência <span className="text-text-disabled">(opcional)</span>
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        Fale o que mais gostou ou que pode melhorar
      </p>

      <div className="flex flex-col gap-4">
        <Textarea
          label="Comentário"
          placeholder="Ex: Comida caseira muito saborosa e bem servida. Preço justo e atendimento rápido. Voltarei com certeza!"
          maxLength={500}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          helperText={`${comment.length}/500 caracteres`}
          error={errors?.comment}
        />

        <Input
          label="Quanto você gastou por pessoa?"
          type="number"
          step="0.01"
          min="0.01"
          max="1999"
          placeholder="Ex: 32.50"
          value={amountPaidPerPerson ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            onAmountPaidChange(val ? parseFloat(val) : undefined);
          }}
          error={errors?.amountPaidPerPerson}
        />
      </div>
    </div>
  );
}
