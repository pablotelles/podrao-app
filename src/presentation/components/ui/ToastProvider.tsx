'use client';

import { createContext, useReducer, useCallback, type ReactNode } from 'react';
import { Toast } from './Toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastContextValue {
  showToast: (input: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

type Action = { type: 'ADD'; toast: ToastItem } | { type: 'REMOVE'; id: string };

function reducer(state: ToastItem[], action: Action): ToastItem[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast];
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const showToast = useCallback((input: Omit<ToastItem, 'id'>) => {
    dispatch({ type: 'ADD', toast: { ...input, id: crypto.randomUUID() } });
  }, []);

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-21 left-4 right-4 flex flex-col gap-2"
        style={{ zIndex: 'var(--z-toast)' }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={dismissToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
