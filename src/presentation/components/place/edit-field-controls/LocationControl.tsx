'use client';

import { X } from 'lucide-react';
import type { AutocompleteResult } from '@/domain/interfaces/IMapProvider';
import { AddressAutocomplete } from '@/presentation/components/ui/AddressAutocomplete';

export interface LocationControlProps {
  currentValue: string;
  value: AutocompleteResult | null;
  onChange: (v: AutocompleteResult | null) => void;
}

export function LocationControl({ currentValue, value, onChange }: LocationControlProps) {
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

      {value ? (
        <div
          className="flex items-center justify-between gap-2 rounded-md border px-3 py-2.5"
          style={{
            borderColor: 'var(--color-brand)',
            backgroundColor: 'var(--color-brand-subtle)',
          }}
        >
          <span
            className="flex-1 truncate text-sm font-medium"
            style={{ color: 'var(--color-brand)' }}
          >
            {value.displayName}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="shrink-0 rounded-full p-0.5 transition-opacity hover:opacity-70"
            aria-label="Limpar endereço selecionado"
          >
            <X size={14} style={{ color: 'var(--color-brand)' }} />
          </button>
        </div>
      ) : (
        <AddressAutocomplete
          selected={null}
          onSelect={(result) => onChange(result)}
          onClear={() => onChange(null)}
          placeholder="Buscar novo endereço..."
        />
      )}
    </div>
  );
}
