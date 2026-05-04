'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface FullScreenDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * Drawer que cobre a tela inteira, desliza da direita.
 * Reutilizável para edição, detalhes, fluxos multi-step, etc.
 */
export function FullScreenDrawer({ open, onClose, title, children }: FullScreenDrawerProps) {
  // Bloqueia scroll do body enquanto aberto
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Fecha com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className={[
        'fixed inset-0 flex flex-col bg-bg',
        'transition-transform duration-300 ease-out',
        open ? 'translate-x-0' : 'translate-x-full',
      ].join(' ')}
      style={{ zIndex: 'var(--z-modal)' }}
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-bg px-(--spacing-page-x) py-4">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-bg-subtle transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
        {title && <h2 className="text-base font-semibold text-text-primary">{title}</h2>}
      </header>

      {/* Conteúdo rolável */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
