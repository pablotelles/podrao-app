'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CriarListaFAB() {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Criar lista"
      onClick={() => router.push('/lists/new')}
      className="flex items-center justify-center rounded-full bg-brand text-text-inverse"
      style={{
        position: 'fixed',
        bottom: 'calc(56px + 16px)',
        right: '16px',
        width: '48px',
        height: '48px',
        boxShadow: 'var(--shadow-fab)',
        zIndex: 'var(--z-sticky)',
      }}
    >
      <Plus size={22} strokeWidth={2.2} />
    </button>
  );
}
