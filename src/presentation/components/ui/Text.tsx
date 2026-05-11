import { cva, type VariantProps } from 'class-variance-authority';
import type { ElementType, HTMLAttributes } from 'react';

const textVariants = cva('', {
  variants: {
    variant: {
      display: [
        'text-(--font-size-display)',
        'font-(--font-weight-bold)',
        'leading-(--line-height-tight)',
        'tracking-(--letter-spacing-tight)',
      ],
      heading: [
        'text-(--font-size-heading)',
        'font-(--font-weight-bold)',
        'leading-(--line-height-tight)',
        'tracking-(--letter-spacing-snug)',
      ],
      subheading: [
        'text-(--font-size-subheading)',
        'font-(--font-weight-semibold)',
        'leading-(--line-height-snug)',
        'tracking-(--letter-spacing-normal)',
      ],
      body: [
        'text-(--font-size-body)',
        'font-(--font-weight-regular)',
        'leading-(--line-height-base)',
      ],
      'body-strong': [
        'text-(--font-size-body)',
        'font-(--font-weight-semibold)',
        'leading-(--line-height-snug)',
      ],
      label: [
        'text-(--font-size-label)',
        'font-(--font-weight-semibold)',
        'leading-(--line-height-snug)',
      ],
      caption: [
        'text-(--font-size-caption)',
        'font-(--font-weight-medium)',
        'leading-(--line-height-relaxed)',
      ],
    },
    textColor: {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
      brand: 'text-brand',
      disabled: 'text-text-disabled',
      inverse: 'text-text-inverse',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error',
      info: 'text-info',
    },
  },
  defaultVariants: { variant: 'body', textColor: 'primary' },
});

type Variant = NonNullable<VariantProps<typeof textVariants>['variant']>;

const defaultTagByVariant: Record<Variant, ElementType> = {
  display: 'h1',
  heading: 'h2',
  subheading: 'h3',
  body: 'p',
  'body-strong': 'p',
  label: 'span',
  caption: 'span',
};

export interface TextProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>, VariantProps<typeof textVariants> {
  as?: ElementType;
  /** Passed through when `as="label"` */
  htmlFor?: string;
}

export function Text({ as, variant, textColor, className, ...props }: TextProps) {
  const Tag = (as ?? defaultTagByVariant[variant ?? 'body']) as ElementType;
  return <Tag className={textVariants({ variant, textColor, className })} {...props} />;
}
