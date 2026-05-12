'use client';

import { Check } from 'lucide-react';
import { PAYMENT_METHOD_OPTIONS } from '@/presentation/lib/editFieldOptions';

export interface PaymentMethodsControlProps {
  currentValue: string[];
  value: string[];
  onChange: (v: string[]) => void;
}

export function PaymentMethodsControl({
  currentValue,
  value,
  onChange,
}: PaymentMethodsControlProps) {
  const currentLabel = currentValue.length > 0 ? currentValue.join(', ') : '—';

  function toggle(opt: string) {
    if (value.includes(opt)) {
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
        {PAYMENT_METHOD_OPTIONS.map((opt) => {
          const isSelected = value.includes(opt.value);
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
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
