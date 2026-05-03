import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-[var(--radius-lg)] bg-[var(--color-bg-card)]',
        'shadow-[var(--shadow-card)] border border-[var(--color-border)]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
