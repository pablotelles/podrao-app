import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const nameVariants = cva('font-bold text-text-primary leading-tight', {
  variants: {
    size: {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
      xl: 'text-2xl',
    },
  },
  defaultVariants: { size: 'md' },
});

interface UserNameProps extends VariantProps<typeof nameVariants> {
  name: string;
}

export function UserName({ name, size }: UserNameProps) {
  return <h2 className={nameVariants({ size })}>{name}</h2>;
}
