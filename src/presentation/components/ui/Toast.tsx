'use client';

import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const iconMap: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColorMap: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
};

const borderColorMap: Record<ToastType, string> = {
  success: 'var(--color-success)',
  error: 'var(--color-error)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
};

export function Toast({ id, type, title, message, duration, onClose }: ToastProps) {
  const Icon = iconMap[type];

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration ?? 4000);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex w-full animate-slide-up items-start gap-3 rounded-md p-3 shadow-(--shadow-modal)"
      style={{ backgroundColor: 'var(--color-text-primary)' }}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColorMap[type]}`} />
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-inverse)' }}>
          {title}
        </p>
        {message && (
          <p className="mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {message}
          </p>
        )}
      </div>
      <button
        type="button"
        aria-label="Fechar notificação"
        onClick={() => onClose(id)}
        className="shrink-0 self-start"
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
