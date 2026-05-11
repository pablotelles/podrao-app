'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

/**
 * Shown at the end of the Zona B horizontal scroll when coverage is normal (4+ places).
 * Invites the user to add a new place.
 */
export function PlaceCardContribute() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/add-place')}
      aria-label="Adicionar um lugar"
      className="flex flex-none flex-col items-center justify-center gap-2 rounded-md border border-dashed border-brand bg-brand-subtle px-3 py-3.5 text-center"
      style={{ width: '144px', scrollSnapAlign: 'start' }}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-text-inverse">
        <Plus size={16} strokeWidth={2.5} />
      </div>
      <p
        className="font-medium text-brand leading-snug"
        style={{ fontSize: 'var(--font-size-caption)' }}
      >
        Adicione um lugar que você conhece
      </p>
    </button>
  );
}
