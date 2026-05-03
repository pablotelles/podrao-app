import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={['rounded-lg bg-bg-card border border-border shadow-(--shadow-card)', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
