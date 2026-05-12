'use client';

import { Input } from '@/presentation/components/ui/Input';
import { Textarea } from '@/presentation/components/ui/Textarea';

export interface ScalarTextControlProps {
  currentValue: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  maxLength?: number;
}

export function ScalarTextControl({
  currentValue,
  value,
  onChange,
  multiline = false,
  maxLength,
}: ScalarTextControlProps) {
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
        <p className="text-sm font-medium text-text-primary">{currentValue || '—'}</p>
      </div>

      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          rows={4}
          placeholder="Digite o novo valor..."
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          placeholder="Digite o novo valor..."
        />
      )}
    </div>
  );
}
