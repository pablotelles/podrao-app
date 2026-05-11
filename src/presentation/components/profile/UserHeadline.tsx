import { Text } from '@/presentation/components/ui/Text';

const sizeToVariant = {
  sm: 'label',
  md: 'body',
  lg: 'subheading',
} as const;

const clampClass = {
  none: '',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
} as const;

type Size = keyof typeof sizeToVariant;
type Clamp = keyof typeof clampClass;

interface UserHeadlineProps {
  headline: string;
  size?: Size;
  clamp?: Clamp;
}

export function UserHeadline({ headline, size, clamp }: UserHeadlineProps) {
  const variant = sizeToVariant[size ?? 'md'];
  const clampClassName = clampClass[clamp ?? 'none'];
  return (
    <Text as="p" variant={variant} className={clampClassName || undefined}>
      {headline}
    </Text>
  );
}
