'use client';

import { MapPin } from 'lucide-react';
import type { AutocompleteResult } from '@/domain/interfaces/IMapProvider';

interface AddressSuggestionItemProps {
  result: AutocompleteResult;
  onClick: () => void;
}

function singleLine(r: AutocompleteResult): string {
  const { road, houseNumber, neighbourhood, city } = r.address ?? {};
  return [road ?? r.displayPlace, houseNumber, neighbourhood, city].filter(Boolean).join(', ');
}

export function AddressSuggestionItem({ result, onClick }: AddressSuggestionItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-brand-subtle"
    >
      <MapPin size={16} className="shrink-0 text-text-disabled" />
      <p
        className="min-w-0 flex-1 truncate text-text-primary"
        style={{ fontSize: 'var(--font-size-label)' }}
      >
        {singleLine(result)}
      </p>
    </button>
  );
}
