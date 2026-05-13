'use client';

import type { ReactNode } from 'react';
import { useTopBarState } from '@/presentation/contexts/TopBarContext';

export function MainLayout({ children }: { children: ReactNode }) {
  const { hideTopBar } = useTopBarState();
  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{
        paddingTop: hideTopBar ? 0 : 'calc(var(--topbar-height) + var(--subheader-height))',
      }}
    >
      {children}
    </div>
  );
}
