import { cva, type VariantProps } from 'class-variance-authority';

const nicknameVariants = cva('text-text-secondary', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: { size: 'md' },
});

interface UserNicknameProps extends VariantProps<typeof nicknameVariants> {
  nickname: string;
  showAt?: boolean;
}

export function UserNickname({ nickname, showAt = true, size }: UserNicknameProps) {
  return (
    <p className={nicknameVariants({ size })}>
      {showAt ? '@' : ''}
      {nickname}
    </p>
  );
}
