import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-bg-subtle text-text-secondary',
        brand:   'bg-brand-subtle text-brand',
        success: 'bg-green-50 text-success',
        warning: 'bg-amber-50 text-warning',
        error:   'bg-red-50 text-error',
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
