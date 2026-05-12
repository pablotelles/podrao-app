'use client';

import { Toggle } from '@/presentation/components/ui/Toggle';

export interface BooleanToggleControlProps {
  label: string;
  currentValue: boolean;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function BooleanToggleControl({
  label,
  currentValue,
  value,
  onChange,
}: BooleanToggleControlProps) {
  const currentLabel = currentValue ? 'Sim' : 'Não';

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

      <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <Toggle checked={value} onChange={onChange} />
      </div>
    </div>
  );
}
