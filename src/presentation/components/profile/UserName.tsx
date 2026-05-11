import type { ElementType } from 'react';
import { Text } from '@/presentation/components/ui/Text';

const sizeToVariant = {
  sm: 'subheading',
  md: 'heading',
  lg: 'display',
  xl: 'display',
} as const;

type Size = keyof typeof sizeToVariant;

interface UserNameProps {
  name: string;
  size?: Size;
  as?: ElementType;
}

export function UserName({ name, size = 'md', as = 'h2' }: UserNameProps) {
  const variant = sizeToVariant[size];
  const extraClass = size === 'xl' ? 'text-(--font-size-display-lg)' : undefined;
  return (
    <Text as={as} variant={variant} className={extraClass}>
      {name}
    </Text>
  );
}
