'use client';

import { PRICE_BUCKET_OPTIONS } from '@/presentation/lib/editFieldOptions';
import { PRICE_BUCKET_SYMBOL, PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';

export interface PriceBucketControlProps {
  currentValue: string;
  value: string;
  onChange: (v: string) => void;
}

export function PriceBucketControl({ currentValue, value, onChange }: PriceBucketControlProps) {
  const currentLabel = currentValue
    ? `${PRICE_BUCKET_SYMBOL[currentValue as PriceBucket] ?? ''} · ${PRICE_BUCKET_LABELS[currentValue as PriceBucket] ?? currentValue}`
    : '—';

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

      <div className="grid grid-cols-2 gap-2">
        {PRICE_BUCKET_OPTIONS.map((opt) => {
          const symbol = PRICE_BUCKET_SYMBOL[opt.value as PriceBucket] ?? opt.value;
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="flex flex-col items-center gap-1 rounded-md border px-3 py-3 transition-colors"
              style={{
                borderColor: isSelected ? 'var(--color-brand)' : 'var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-brand-subtle)' : 'var(--color-bg)',
              }}
            >
              <span
                className="font-bold"
                style={{
                  fontSize: 'var(--font-size-subheading)',
                  color: isSelected ? 'var(--color-brand)' : 'var(--color-text-primary)',
                }}
              >
                {symbol}
              </span>
              <span
                className="text-center"
                style={{
                  fontSize: 'var(--font-size-caption)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
