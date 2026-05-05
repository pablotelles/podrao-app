'use client';

import type { ReactNode } from 'react';
import { Sheet } from './Sheet';

export interface ActionItem {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  header?: ReactNode;
  actions: ActionItem[];
}

export function ActionSheet({ open, onClose, header, actions }: ActionSheetProps) {
  return (
    <Sheet open={open} onClose={onClose}>
      {header && (
        <>
          {header}
          <hr className="my-3 border-border" />
        </>
      )}

      <div className="flex flex-col">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className={[
              'flex items-center gap-3 rounded-lg px-2 py-3 text-sm font-medium transition-colors hover:bg-bg-subtle',
              action.variant === 'danger' ? 'text-error' : 'text-text-primary',
            ].join(' ')}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              {action.icon}
            </span>
            {action.label}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
