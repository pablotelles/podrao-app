import type { ReactNode } from 'react';

interface HighlightCardProps {
  icon: ReactNode | string;
  title: string;
  subtitle?: string;
}

export function HighlightCard({ icon, title, subtitle }: HighlightCardProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-highlight-border bg-highlight-bg px-3 py-2.5">
      <span className="shrink-0 text-xl leading-none">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-highlight-text">{title}</p>
        {subtitle && <p className="mt-0.5 text-[13px] text-warning">{subtitle}</p>}
      </div>
    </div>
  );
}
