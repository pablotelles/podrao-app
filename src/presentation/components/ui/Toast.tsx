'use client';

import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  children: ReactNode;
  className?: string;
}

const colorMap: Record<ToastType, string> = {
  success: 'bg-success',
  error: 'bg-error',
  info: 'bg-info',
  warning: 'bg-warning',
};

export function Toast({ type, children, className = '' }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 animate-slide-up rounded-md px-4 py-3 text-sm font-medium text-text-inverse shadow-(--shadow-card) ${colorMap[type]} ${className}`}
      style={{ zIndex: 'var(--z-toast)' }}
    >
      {children}
    </div>
  );
}
