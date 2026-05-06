'use client';

import { useState } from 'react';
import { usePageTitle } from '@/presentation/contexts/TopBarContext';
import { SubHeaderPortal } from '@/presentation/components/navigation/SubHeaderPortal';
import { useSubHeaderHeight } from '@/presentation/hooks/useSubHeaderHeight';
import { ListList, UserListsSection } from '@/presentation/components/lists';
import { usePublicLists, useSavedLists } from '@/presentation/hooks/useListsExplore';

type ListsTab = 'explorar' | 'minhas' | 'salvas';

const TABS: { id: ListsTab; label: string }[] = [
  { id: 'explorar', label: 'Explorar' },
  { id: 'minhas', label: 'Minhas Listas' },
  { id: 'salvas', label: 'Salvas' },
];

// Tab bar height matches the default in useSubHeaderHeight (52px)

function ExplorarTab() {
  const { lists, isLoading } = usePublicLists();
  return (
    <div className="px-(--spacing-page-x) py-4">
      <ListList lists={lists} isLoading={isLoading} />
    </div>
  );
}

function SalvasTab() {
  const { lists, isLoading } = useSavedLists();
  return (
    <div className="px-(--spacing-page-x) py-4">
      <ListList lists={lists} isLoading={isLoading} />
    </div>
  );
}

export default function ListsPage() {
  usePageTitle('Listas');
  useSubHeaderHeight();
  const [activeTab, setActiveTab] = useState<ListsTab>('explorar');

  return (
    <>
      <SubHeaderPortal>
        <div className="flex overflow-x-auto border-b border-border bg-bg">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex flex-1 min-w-0 items-center justify-center px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'text-brand border-b-2 border-brand'
                  : 'text-text-secondary border-b-2 border-transparent hover:text-text-primary',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </SubHeaderPortal>

      <main className="pb-16">
        {activeTab === 'explorar' && <ExplorarTab />}
        {activeTab === 'minhas' && (
          <div className="px-(--spacing-page-x) py-4">
            <UserListsSection />
          </div>
        )}
        {activeTab === 'salvas' && <SalvasTab />}
      </main>
    </>
  );
}
