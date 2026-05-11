'use client';

import { useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus } from 'lucide-react';

const STORAGE_KEY = 'podrao_contributed_at';
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Zona E — Contribution invite block.
 * Skips rendering for 24h after the user last submitted a place.
 * Uses useLayoutEffect to read localStorage before first paint, preventing hydration mismatch.
 */
export function ContributeBlock() {
  const router = useRouter();
  // null = not yet checked (server render). true = should show. false = skip (contributed recently).
  const [visible, setVisible] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ts = Number(raw);
        if (!Number.isNaN(ts) && Date.now() - ts < COOLDOWN_MS) {
          setVisible(false);
          return;
        }
      }
    } catch {
      // localStorage unavailable — show the block
    }
    setVisible(true);
  }, []);

  // Render nothing on server or while checking
  if (visible !== true) return null;

  return (
    <div
      className="mx-(--spacing-page-x) mt-6 flex items-start gap-3 rounded-md bg-bg-subtle p-4"
      role="region"
      aria-label="Contribua com o Podrao"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-brand-subtle text-brand">
        <MapPin size={20} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-text-primary leading-snug"
          style={{ fontSize: 'var(--font-size-label)' }}
        >
          Tem um achado que vale compartilhar?
        </p>
        <p
          className="mt-0.5 text-text-secondary leading-snug"
          style={{ fontSize: 'var(--font-size-caption)' }}
        >
          Adicione e ele aparece aqui para todo mundo que estiver por perto.
        </p>
        <button
          onClick={() => router.push('/add-place')}
          className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 font-semibold text-text-inverse"
          style={{ fontSize: 'var(--font-size-caption)' }}
        >
          <Plus size={11} strokeWidth={2.5} />
          Adicionar lugar
        </button>
      </div>
    </div>
  );
}
