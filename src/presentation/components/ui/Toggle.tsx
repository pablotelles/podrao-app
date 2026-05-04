'use client';

import { cva, type VariantProps } from 'class-variance-authority';

const toggleVariants = cva(
  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2',
  {
    variants: {
      checked: {
        true: 'bg-brand',
        false: 'bg-surface-tertiary',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: {
      checked: false,
      disabled: false,
    },
  },
);

const toggleThumbVariants = cva(
  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
  {
    variants: {
      checked: {
        true: 'translate-x-6',
        false: 'translate-x-1',
      },
    },
    defaultVariants: {
      checked: false,
    },
  },
);

export interface ToggleProps extends VariantProps<typeof toggleVariants> {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ id, checked, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={toggleVariants({ checked, disabled })}
    >
      <span className={toggleThumbVariants({ checked })} />
    </button>
  );
}
