'use client';

import type { ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Sheet({ open, onClose, children, title }: SheetProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-lg bg-bg shadow-(--shadow-modal) px-(--spacing-page-x) pb-8 pt-4 max-h-[85dvh] overflow-y-auto"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        {title && (
          <h2 className="mb-4 text-base font-semibold text-text-primary">{title}</h2>
        )}
        {children}
      </div>
    </>
  );
}
