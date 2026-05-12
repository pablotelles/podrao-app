'use client';

import { Check } from 'lucide-react';
import { PERIOD_OPTIONS } from '@/presentation/lib/editFieldOptions';
import { OPERATING_PERIOD_META } from '@/domain/value-objects/OperatingPeriod';

export interface PeriodsControlProps {
  currentValue: string[];
  value: string[];
  onChange: (v: string[]) => void;
}

export function PeriodsControl({ currentValue, value, onChange }: PeriodsControlProps) {
  const currentLabel =
    currentValue.length > 0
      ? currentValue
          .map((v) => {
            const meta = OPERATING_PERIOD_META[v as keyof typeof OPERATING_PERIOD_META];
            return meta ? `${meta.emoji} ${meta.label}` : v;
          })
          .join(', ')
      : '—';

  function toggle(opt: string) {
    if (value.includes(opt)) {
      if (value.length <= 1) return; // min 1
      onChange(value.filter((v) => v !== opt));
    } else {
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

      <div className="flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((opt) => {
          const isSelected = value.includes(opt.value);
          const meta = OPERATING_PERIOD_META[opt.value as keyof typeof OPERATING_PERIOD_META];
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors"
              style={{
                fontSize: 'var(--font-size-label)',
                fontWeight: 500,
                borderColor: isSelected ? 'var(--color-brand)' : 'var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-brand-subtle)' : 'var(--color-bg)',
                color: isSelected ? 'var(--color-brand)' : 'var(--color-text-secondary)',
              }}
            >
              {isSelected && <Check size={10} strokeWidth={3} />}
              {meta ? `${meta.emoji} ${meta.label}` : opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
