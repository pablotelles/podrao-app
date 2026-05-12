'use client';

import { useState } from 'react';
import { Plus, X, type LucideIcon } from 'lucide-react';

export interface FABAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

interface FABProps {
  actions: FABAction[];
  'aria-label'?: string;
}

/**
 * Floating Action Button — single-click when 1 action, speed-dial when 2+.
 */
export function FAB({ actions, 'aria-label': ariaLabel = 'Ações' }: FABProps) {
  const [open, setOpen] = useState(false);

  if (actions.length === 0) return null;

  if (actions.length === 1) {
    const { icon: Icon, label, onClick } = actions[0];
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-text-inverse shadow-(--shadow-fab) transition-transform hover:bg-brand-hover active:scale-95"
        style={{ zIndex: 'calc(var(--z-sticky) + 1)' }}
      >
        <Icon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 'var(--z-sticky)' }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className="fixed bottom-20 right-4 flex flex-col items-end gap-2.5"
        style={{ zIndex: 'calc(var(--z-sticky) + 1)' }}
      >
        {open &&
          actions.map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setOpen(false);
                onClick();
              }}
              className="flex items-center gap-2.5 rounded-full bg-bg px-4 py-2.5 text-sm font-semibold text-text-primary shadow-(--shadow-card) transition-colors hover:bg-bg-subtle"
            >
              <Icon className="h-4 w-4 shrink-0 text-brand" />
              {label}
            </button>
          ))}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-text-inverse shadow-(--shadow-fab) transition-transform hover:bg-brand-hover active:scale-95"
          aria-label={ariaLabel}
        >
          {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </button>
      </div>
    </>
  );
}
