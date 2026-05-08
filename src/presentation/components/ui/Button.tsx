'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-text-inverse hover:bg-brand-hover',
        secondary: 'bg-bg-subtle text-text-primary border border-border hover:bg-border',
        ghost: 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary',
        danger: 'bg-error text-text-inverse hover:opacity-90',
        dashed: '!rounded-xl border border-dashed border-brand text-brand hover:bg-brand/5',
      },
      size: {
        xs: 'h-6 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

const activeColorVars: Record<string, string> = {
  brand: 'var(--color-brand)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  isActive?: boolean;
  activeColor?: 'brand' | 'success' | 'warning' | 'error';
}

export function Button({
  variant,
  size,
  className,
  isLoading,
  loadingText,
  isActive,
  activeColor = 'brand',
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const activeStyle =
    isActive && activeColor ? { color: activeColorVars[activeColor], ...style } : style;

  if (isLoading) {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        disabled={true}
        style={activeStyle}
        {...props}
      >
        {loadingText ? (
          <>
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            <span>{loadingText}</span>
          </>
        ) : (
          <span className="relative inline-flex items-center justify-center gap-2">
            <span className="opacity-0">{children}</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      className={buttonVariants({ variant, size, className })}
      disabled={disabled}
      style={activeStyle}
      {...props}
    >
      {children}
    </button>
  );
}
