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
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'h-10 w-full rounded-md border border-border',
          'bg-bg px-3 text-sm text-text-primary',
          'placeholder:text-text-disabled',
          'focus:outline-none focus:ring-2 focus:ring-brand',
          'disabled:opacity-50',
          error ? 'border-error' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
