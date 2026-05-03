import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]',
        brand: 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)]',
        success: 'bg-green-50 text-[var(--color-success)]',
        warning: 'bg-amber-50 text-[var(--color-warning)]',
        error: 'bg-red-50 text-[var(--color-error)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ variant, className, ...props }: BadgeProps) {
  return <span className={badgeVariants({ variant, className })} {...props} />;
}
