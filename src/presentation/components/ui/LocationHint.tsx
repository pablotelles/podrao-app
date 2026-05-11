'use client';

import { MapPin } from 'lucide-react';
import { Text } from './Text';

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
      <Text as="span" variant="caption" textColor="brand" className="flex-1">
        Permita a localização para ver listas perto de você.
      </Text>
      <button type="button" onClick={onAllow} className="whitespace-nowrap">
        <Text as="span" variant="label" textColor="brand">
          Permitir
        </Text>
      </button>
    </div>
  );
}
