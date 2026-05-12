'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /** Custom header node. When provided, replaces the built-in title heading. */
  header?: ReactNode;
  /** Sticky footer rendered outside the scroll area. Requires a split flex layout. */
  footer?: ReactNode;
  ariaLabel?: string;
}

export function Sheet({ open, onClose, children, title, header, footer, ariaLabel }: SheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Push a history entry when the sheet opens so the back button closes it.
  useEffect(() => {
    if (!open) return;

    history.pushState({ sheet: true }, '');

    const handlePop = () => onClose();
    window.addEventListener('popstate', handlePop);

    return () => {
      window.removeEventListener('popstate', handlePop);
      // If the sheet closes without the back button (e.g. backdrop click),
      // pop the history entry we pushed so the stack stays clean.
      if (history.state?.sheet) history.back();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !mounted) return null;

  const hasSplit = !!header || !!footer;

  const content = (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        style={{ zIndex: 'var(--z-overlay)' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        className={
          hasSplit
            ? 'fixed bottom-0 left-0 right-0 flex flex-col rounded-t-lg bg-bg shadow-(--shadow-modal) max-h-[85dvh]'
            : 'fixed bottom-0 left-0 right-0 rounded-t-lg bg-bg shadow-(--shadow-modal) px-(--spacing-page-x) pb-8 pt-4 max-h-[85dvh] overflow-y-auto'
        }
        style={{ zIndex: 'var(--z-modal)' }}
      >
        <div className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-full bg-border" />
        {hasSplit ? (
          <>
            {header && <div className="shrink-0">{header}</div>}
            <div className="flex-1 overflow-y-auto px-(--spacing-page-x) py-4">{children}</div>
            {footer && <div className="shrink-0">{footer}</div>}
          </>
        ) : (
          <>
            {title && (
              <h2 className="mb-4 mt-3 text-base font-semibold text-text-primary">{title}</h2>
            )}
            {children}
          </>
        )}
      </div>
    </>
  );

  return createPortal(content, document.body);
}
