'use client';

import { Pencil } from 'lucide-react';

interface PlaceSuggestEditButtonProps {
  onClick?: () => void;
}

export function PlaceSuggestEditButton({ onClick }: PlaceSuggestEditButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-bg-subtle"
      style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-text-secondary)',
      }}
    >
      <Pencil size={13} />
      Sugerir correção
    </button>
  );
}
