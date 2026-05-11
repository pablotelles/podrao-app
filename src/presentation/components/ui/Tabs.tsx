'use client';

import { useState } from 'react';
import { Text } from './Text';

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
          <Text
            as="button"
            key={tab.id}
            variant="label"
            textColor={active === tab.id ? 'brand' : 'secondary'}
            onClick={() => setActive(tab.id)}
            className={[
              'flex flex-1 min-w-0 items-center justify-center gap-1.5 px-3 py-3 transition-colors whitespace-nowrap border-b-2',
              active === tab.id ? 'border-brand' : 'border-transparent hover:text-text-primary',
            ].join(' ')}
          >
            {tab.icon}
            {tab.label}
          </Text>
        ))}
      </div>
      <div>{children(active)}</div>
    </div>
  );
}
