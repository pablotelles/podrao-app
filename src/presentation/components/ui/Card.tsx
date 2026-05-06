import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & { noPadding?: boolean };

export function Card({ className = '', noPadding = false, children, ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-sm bg-bg-card border border-border shadow-(--shadow-card)',
        noPadding ? '' : 'p-4',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
