import { Text } from '@/presentation/components/ui/Text';

const sizeToVariant = {
  sm: 'caption',
  md: 'label',
  lg: 'body',
} as const;

type Size = keyof typeof sizeToVariant;

interface UserNicknameProps {
  nickname: string;
  showAt?: boolean;
  size?: Size;
}

export function UserNickname({ nickname, showAt = true, size }: UserNicknameProps) {
  const variant = sizeToVariant[size ?? 'md'];
  return (
    <Text as="p" variant={variant} textColor="secondary">
      {showAt ? '@' : ''}
      {nickname}
    </Text>
  );
}
