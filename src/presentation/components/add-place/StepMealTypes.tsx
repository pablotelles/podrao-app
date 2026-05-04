'use client';
import { MealTypeCard } from '@/presentation/components/ui';
import { MEAL_TYPES, MEAL_TYPE_META } from '@/domain/value-objects/MealType';

interface StepMealTypesProps {
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}

export function StepMealTypes({ value, onChange, error }: StepMealTypesProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">O que serve aqui?</h2>
      <div className="grid grid-cols-3 gap-3">
        {MEAL_TYPES.map((type) => (
          <MealTypeCard
            key={type}
            emoji={MEAL_TYPE_META[type].emoji}
            label={MEAL_TYPE_META[type].label}
            selected={value.includes(type)}
            onToggle={() => {
              if (value.includes(type)) {
                onChange(value.filter((t) => t !== type));
              } else {
                onChange([...value, type]);
              }
            }}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </div>
  );
}
