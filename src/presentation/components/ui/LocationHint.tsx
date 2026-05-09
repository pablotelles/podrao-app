'use client';

import { MapPin } from 'lucide-react';

interface LocationHintProps {
  onAllow: () => void;
}

export function LocationHint({ onAllow }: LocationHintProps) {
  return (
    <div
      role="status"
      className="mx-(--spacing-page-x) mb-3 flex items-center gap-2.5 rounded-md bg-brand-subtle px-3.5 py-2.5"
    >
      <MapPin size={16} className="shrink-0 text-brand" />
      <span className="flex-1 text-xs text-brand">
        Permita a localização para ver listas perto de você.
      </span>
      <button
        type="button"
        onClick={onAllow}
        className="whitespace-nowrap text-xs font-semibold text-brand"
      >
        Permitir
      </button>
    </div>
  );
}
