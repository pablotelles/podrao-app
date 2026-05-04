'use client';

import { Textarea, Input, ToggleGroup } from '@/presentation/components/ui';
import { MEAL_TYPES, type MealType } from '@/domain/value-objects/MealType';

interface StepCommentProps {
  comment: string;
  onCommentChange: (value: string) => void;
  mealType?: MealType;
  onMealTypeChange: (value: MealType | undefined) => void;
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
  mealType,
  onMealTypeChange,
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

        <div>
          <p className="mb-2 text-sm font-medium text-text-primary">Tipo de refeição</p>
          <p className="mb-3 text-xs text-text-secondary">
            Dica: comentários detalhados ajudam outras pessoas
          </p>
          <ToggleGroup
            mode="single"
            options={MEAL_TYPES}
            value={mealType}
            onChange={(v) => onMealTypeChange(v)}
          />
        </div>

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
