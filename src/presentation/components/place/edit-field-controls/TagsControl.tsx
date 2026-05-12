'use client';

import { Check } from 'lucide-react';

export interface TagsControlProps {
  options: readonly string[];
  maxSelected: number;
  currentValue: string[];
  value: string[];
  onChange: (v: string[]) => void;
}

export function TagsControl({
  options,
  maxSelected,
  currentValue,
  value,
  onChange,
}: TagsControlProps) {
  const currentLabel = currentValue.length > 0 ? currentValue.join(', ') : '—';
  const atMax = value.length >= maxSelected;

  function toggle(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else if (!atMax) {
      onChange([...value, opt]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border border-border bg-bg-subtle px-3 py-2.5">
        <p
          className="mb-0.5 uppercase tracking-wider"
          style={{
            fontSize: 'var(--font-size-caption)',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}
        >
          Valor atual
        </p>
        <p className="text-sm font-medium text-text-primary">{currentLabel}</p>
      </div>

      <p
        className="text-right"
        style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}
      >
        {value.length}/{maxSelected} selecionados
      </p>

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value.includes(opt);
          const isDisabled = !isSelected && atMax;
          return (
            <button
              key={opt}
              type="button"
              disabled={isDisabled}
              onClick={() => toggle(opt)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontSize: 'var(--font-size-label)',
                fontWeight: 500,
                borderColor: isSelected ? 'var(--color-brand)' : 'var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-brand-subtle)' : 'var(--color-bg)',
                color: isSelected ? 'var(--color-brand)' : 'var(--color-text-secondary)',
              }}
            >
              {isSelected && <Check size={10} strokeWidth={3} />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
