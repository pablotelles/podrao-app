'use client';

import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';

/**
 * Shown in the Zona B horizontal scroll when nearby coverage is sparse (< 3 places).
 * Communicates the gap and invites the user to contribute.
 */
export function PlaceCardSparseInvite() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/add-place')}
      aria-label="Adicionar um lugar nesta área"
      className="flex flex-none flex-col items-center justify-center gap-2.5 rounded-md border border-dashed border-border bg-bg-subtle px-3.5 py-4 text-center"
      style={{ width: '200px', scrollSnapAlign: 'start' }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-subtle text-brand">
        <MapPin size={18} strokeWidth={2.5} />
      </div>
      <p
        className="font-medium text-text-secondary leading-snug"
        style={{ fontSize: 'var(--font-size-caption)' }}
      >
        O Podrao ainda está chegando aqui — adicione um lugar que você conhece
      </p>
      <span
        className="rounded-full bg-brand-subtle px-3 py-1 font-semibold text-brand"
        style={{ fontSize: 'var(--font-size-caption)' }}
      >
        Adicionar lugar
      </span>
    </button>
  );
}
