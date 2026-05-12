'use client';

import { useState } from 'react';
import { Pencil, ChevronRight } from 'lucide-react';
import { useTopBarAction } from '@/presentation/contexts/TopBarContext';
import { SuggestEditSheet } from '@/presentation/components/place/SuggestEditSheet';
import type { SuggestEditSheetProps } from '@/presentation/components/place/SuggestEditSheet';

export interface PlaceEditActionsProps {
  place: SuggestEditSheetProps['place'];
  pendingEditsByField: Record<string, { id: string }>;
}

export function PlaceEditActions({ place, pendingEditsByField }: PlaceEditActionsProps) {
  const [open, setOpen] = useState(false);
  const pendingCount = Object.keys(pendingEditsByField).length;

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
    <>
      {pendingCount > 0 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 flex w-full items-center gap-2.5 rounded-md border border-verify-border bg-verify-bg px-3.5 py-2.5 text-left transition-colors hover:bg-verify-bg-hover"
        >
          <span className="shrink-0 text-lg" aria-hidden="true">
            🔍
          </span>
          <div className="flex-1">
            <p
              className="font-semibold"
              style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-verify-text)' }}
            >
              {pendingCount === 1 ? '1 edição pendente' : `${pendingCount} edições pendentes`}
            </p>
            <p
              style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}
            >
              Ajude a comunidade a verificar
            </p>
          </div>
          <ChevronRight
            className="h-4 w-4 shrink-0"
            style={{ color: 'var(--color-verify-text)' }}
          />
        </button>
      )}

      <SuggestEditSheet
        open={open}
        onClose={() => setOpen(false)}
        place={place}
        pendingEditsByField={pendingEditsByField}
        placeId={place.id}
      />
    </>
  );
}
