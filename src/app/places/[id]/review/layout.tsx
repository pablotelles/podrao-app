import type { ReactNode } from 'react';

export default function ReviewLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-bg">{children}</div>;
}
