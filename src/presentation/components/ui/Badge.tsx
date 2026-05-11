import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { Text } from './Text';

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5', {
  variants: {
    variant: {
      default: 'bg-bg-subtle text-text-secondary',
      brand: 'bg-brand-subtle text-brand',
      success: 'bg-green-50 text-success',
      warning: 'bg-amber-50 text-warning',
      error: 'bg-red-50 text-error',
    },
  },
  defaultVariants: { variant: 'default' },
});

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ variant, className, children, ...props }: BadgeProps) {
  return (
    <span className={badgeVariants({ variant, className })} {...props}>
      <Text as="span" variant="caption">
        {children}
      </Text>
    </span>
  );
}
