'use client';

import type { InputHTMLAttributes } from 'react';
import { Text } from './Text';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Text as="label" variant="label" htmlFor={id}>
          {label}
        </Text>
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
      {error && (
        <Text as="p" variant="caption" textColor="error">
          {error}
        </Text>
      )}
    </div>
  );
}
