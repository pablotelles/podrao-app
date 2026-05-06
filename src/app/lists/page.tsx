'use client';

import { Tabs } from '@/presentation/components/ui';
import { usePageTitle } from '@/presentation/contexts/TopBarContext';
import { ListList, UserListsSection } from '@/presentation/components/lists';
import { usePublicLists, useSavedLists } from '@/presentation/hooks/useListsExplore';
import type { TabItem } from '@/presentation/components/ui/Tabs';

type ListsTab = 'explorar' | 'minhas' | 'salvas';

const TABS: TabItem<ListsTab>[] = [
  { id: 'explorar', label: 'Explorar' },
  { id: 'minhas', label: 'Minhas Listas' },
  { id: 'salvas', label: 'Salvas' },
];

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
  return (
    <main className="flex h-dvh flex-col bg-bg-subtle pb-16">
      <div className="flex-1 overflow-auto">
        <Tabs tabs={TABS} defaultTab="explorar">
          {(tab) => (
            <>
              {tab === 'explorar' && <ExplorarTab />}
              {tab === 'minhas' && (
                <div className="px-(--spacing-page-x) py-4">
                  <UserListsSection />
                </div>
              )}
              {tab === 'salvas' && <SalvasTab />}
            </>
          )}
        </Tabs>
      </div>
    </main>
  );
}
