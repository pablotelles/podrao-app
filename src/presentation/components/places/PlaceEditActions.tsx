'use client';

import { useState } from 'react';
import { PlaceSuggestEditButton } from '@/presentation/components/places/PlaceSuggestEditButton';
import { SuggestEditSheet } from '@/presentation/components/place/SuggestEditSheet';
import type { SuggestEditSheetProps } from '@/presentation/components/place/SuggestEditSheet';

export interface PlaceEditActionsProps {
  place: SuggestEditSheetProps['place'];
  pendingEditsByField: Record<string, { id: string }>;
}

export function PlaceEditActions({ place, pendingEditsByField }: PlaceEditActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PlaceSuggestEditButton onClick={() => setOpen(true)} />
      <SuggestEditSheet
        open={open}
        onClose={() => setOpen(false)}
        place={place}
        pendingEditsByField={pendingEditsByField}
        placeId={place.id}
      />
    </div>
  );
}
