'use client';

import { ArrowLeft, Search } from 'lucide-react';

interface SearchTopbarProps {
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
}

export function SearchTopbar({ value, onChange, onBack }: SearchTopbarProps) {
  return (
    <header
      className="fixed left-0 right-0 top-0 flex items-center gap-2 border-b border-border bg-bg px-(--spacing-page-x) pt-safe"
      style={{ height: 'var(--topbar-height)', zIndex: 'var(--z-sticky)' }}
    >
      <button
        type="button"
        onClick={onBack}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-bg-subtle"
        aria-label="Voltar"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center gap-2 rounded-full bg-bg-subtle px-3 py-1.5">
        <Search className="h-4 w-4 shrink-0 text-text-disabled" aria-hidden="true" />
        <input
          type="search"
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar lugares e listas..."
          className="flex-1 bg-transparent text-(--font-size-body) text-text-primary placeholder:text-text-disabled focus:outline-none"
        />
      </div>
    </header>
  );
}
