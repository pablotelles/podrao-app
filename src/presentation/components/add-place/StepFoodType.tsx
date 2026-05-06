'use client';
import { FOOD_TYPES, FOOD_TYPE_META } from '@/domain/value-objects/FoodType';

interface StepFoodTypeProps {
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}

export function StepFoodType({ value, onChange, error }: StepFoodTypeProps) {
  const max = 5;
  const handleToggle = (type: string) => {
    if (value.includes(type)) {
      onChange(value.filter((t) => t !== type));
    } else if (value.length < max) {
      onChange([...value, type]);
    }
  };
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">O que tem de bom aqui?</h2>
      <div className="grid grid-cols-3 gap-2">
        {FOOD_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={[
              'flex flex-col items-center justify-center rounded-lg border-2 px-2 py-3 text-xs font-medium transition-all',
              value.includes(type)
                ? 'border-brand bg-brand-subtle text-brand'
                : 'border-border bg-surface text-text-primary',
              value.length >= max && !value.includes(type) ? 'opacity-40 cursor-not-allowed' : '',
            ].join(' ')}
            onClick={() => handleToggle(type)}
            disabled={value.length >= max && !value.includes(type)}
          >
            <span className="text-lg mb-1">{FOOD_TYPE_META[type].emoji}</span>
            {FOOD_TYPE_META[type].label}
          </button>
        ))}
      </div>
      <div className="mt-2 text-xs text-text-secondary">{value.length} selecionados (máx. 3)</div>
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </div>
  );
}
