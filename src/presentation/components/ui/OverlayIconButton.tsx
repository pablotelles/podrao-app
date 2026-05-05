import type { LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

interface OverlayIconButtonProps {
  icon: LucideIcon;
  iconProps?: Omit<ComponentProps<LucideIcon>, 'className'>;
  onClick?: () => void;
  'aria-label': string;
  variant?: 'dark' | 'white';
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const styles = {
  dark: 'h-9 w-9 bg-black/40 text-white backdrop-blur-sm',
  white: 'h-10 w-10 bg-white text-text-primary shadow-md hover:scale-105 disabled:opacity-50',
};

const iconSize = { dark: 'h-5 w-5', white: 'h-5 w-5' };

export function OverlayIconButton({
  icon: Icon,
  iconProps,
  onClick,
  'aria-label': ariaLabel,
  variant = 'dark',
  disabled,
  type = 'button',
}: OverlayIconButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={[
        'flex shrink-0 items-center justify-center rounded-full transition-transform',
        styles[variant],
      ].join(' ')}
    >
      <Icon className={iconSize[variant]} {...iconProps} />
    </button>
  );
}
