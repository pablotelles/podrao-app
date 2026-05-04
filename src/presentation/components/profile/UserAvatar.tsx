import { cva, type VariantProps } from 'class-variance-authority';
import Image from 'next/image';

const avatarVariants = cva(
  'flex items-center justify-center rounded-full bg-brand text-text-inverse font-bold overflow-hidden shrink-0',
  {
    variants: {
      size: {
        sm: 'h-12 w-12 text-base',
        md: 'h-16 w-16 text-xl',
        lg: 'h-20 w-20 text-2xl',
        xl: 'h-24 w-24 text-3xl',
      },
    },
    defaultVariants: { size: 'lg' },
  },
);

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  alt: string;
  fallback: string; // Iniciais ou texto alternativo
}

export function UserAvatar({ src, alt, fallback, size }: UserAvatarProps) {
  return (
    <div className={avatarVariants({ size })}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={200}
          height={200}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}
