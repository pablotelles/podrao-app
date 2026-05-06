'use client';

import { useState } from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  defaultTab?: T;
  children: (activeTab: T) => React.ReactNode;
  className?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  defaultTab,
  children,
  className,
}: TabsProps<T>) {
  const [active, setActive] = useState<T>(defaultTab ?? tabs[0]?.id);

  return (
    <div className={className}>
      <div className="flex overflow-x-auto border-b border-border bg-bg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={[
              'flex flex-1 min-w-0 items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap',
              active === tab.id
                ? 'text-brand border-b-2 border-brand'
                : 'text-text-secondary border-b-2 border-transparent hover:text-text-primary',
            ].join(' ')}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div>{children(active)}</div>
    </div>
  );
}
