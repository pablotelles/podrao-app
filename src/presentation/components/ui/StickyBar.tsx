import type { ReactNode } from 'react';

interface StickyBarProps {
  children: ReactNode;
  className?: string;
}

export function StickyBar({ children, className = '' }: StickyBarProps) {
  return (
    <div
      className={`sticky bg-bg border-b border-border ${className}`}
      style={{
        top: 'calc(var(--topbar-height) + var(--subheader-height))',
        zIndex: 'var(--z-sticky)',
      }}
    >
      {children}
    </div>
  );
}
