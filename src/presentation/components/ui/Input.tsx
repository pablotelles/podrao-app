'use client';

import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]',
          'bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text-primary)]',
          'placeholder:text-[var(--color-text-disabled)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]',
          'disabled:opacity-50',
          error ? 'border-[var(--color-error)]' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
