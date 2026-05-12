'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useTopBarAction } from '@/presentation/contexts/TopBarContext';
import { SuggestEditSheet } from '@/presentation/components/place/SuggestEditSheet';
import type { SuggestEditSheetProps } from '@/presentation/components/place/SuggestEditSheet';

export interface PlaceEditActionsProps {
  place: SuggestEditSheetProps['place'];
  pendingEditsByField: Record<string, { id: string }>;
}

export function PlaceEditActions({ place, pendingEditsByField }: PlaceEditActionsProps) {
  const [open, setOpen] = useState(false);

  useTopBarAction(
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex h-8 w-8 items-center justify-center rounded-full text-text-inverse transition-colors hover:bg-brand-hover"
      aria-label="Sugerir correção"
    >
      <Pencil className="h-4 w-4" />
    </button>,
  );

  return (
    <SuggestEditSheet
      open={open}
      onClose={() => setOpen(false)}
      place={place}
      pendingEditsByField={pendingEditsByField}
      placeId={place.id}
    />
  );
}
