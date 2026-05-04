import { cva, type VariantProps } from 'class-variance-authority';

const headlineVariants = cva('text-text-primary leading-relaxed font-normal', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
    clamp: {
      none: '',
      2: 'line-clamp-2',
      3: 'line-clamp-3',
    },
  },
  defaultVariants: { size: 'md', clamp: 'none' },
});

interface UserHeadlineProps extends VariantProps<typeof headlineVariants> {
  headline: string;
}

export function UserHeadline({ headline, size, clamp }: UserHeadlineProps) {
  return <p className={headlineVariants({ size, clamp })}>{headline}</p>;
}
