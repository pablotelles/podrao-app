'use client';

import { SERVICE_TYPE_OPTIONS } from '@/presentation/lib/editFieldOptions';

export interface ServiceTypeControlProps {
  currentValue: string;
  value: string;
  onChange: (v: string) => void;
}

const SERVICE_TYPE_EMOJI: Record<string, string> = {
  'Só presencial': '🍽️',
  'Só delivery': '🛵',
  'Delivery e presencial': '✅',
};

export function ServiceTypeControl({ currentValue, value, onChange }: ServiceTypeControlProps) {
  const currentLabel = currentValue || '—';

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

      <div className="flex flex-col gap-2">
        {SERVICE_TYPE_OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          const emoji = SERVICE_TYPE_EMOJI[opt.label] ?? '';
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="flex items-center gap-2.5 rounded-md border px-3 py-2.5 transition-colors text-left"
              style={{
                borderColor: isSelected ? 'var(--color-brand)' : 'var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-brand-subtle)' : 'var(--color-bg)',
              }}
            >
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                style={{
                  borderColor: isSelected ? 'var(--color-brand)' : 'var(--color-border)',
                }}
              >
                {isSelected && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-brand)' }}
                  />
                )}
              </span>
              {emoji && <span className="text-base">{emoji}</span>}
              <span
                className="font-medium"
                style={{
                  fontSize: 'var(--font-size-body)',
                  color: 'var(--color-text-primary)',
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
