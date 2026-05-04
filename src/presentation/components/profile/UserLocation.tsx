import { MapPin } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

const locationVariants = cva('flex items-center gap-1 text-text-secondary', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: { size: 'md' },
});

interface UserLocationProps extends VariantProps<typeof locationVariants> {
  location: string;
  showIcon?: boolean;
}

export function UserLocation({ location, showIcon = true, size }: UserLocationProps) {
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  return (
    <p className={locationVariants({ size })}>
      {showIcon && <MapPin size={iconSize} />}
      {location}
    </p>
  );
}
