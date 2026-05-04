'use client';

import { PageHeader, Tabs, EmptyState } from '@/presentation/components/ui';
import { ListCard } from '@/presentation/components/lists/ListCard';
import { UserListsSection } from '@/presentation/components/lists/UserListsSection';
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-(--spacing-page-x) py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!lists.length) {
    return (
      <div className="px-(--spacing-page-x) py-4">
        <EmptyState icon="📋" title="Nenhuma lista pública ainda" description="" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-(--spacing-page-x) py-4">
      {lists.map((list) => (
        <ListCard key={list.id} list={list} />
      ))}
    </div>
  );
}

function SalvasTab() {
  const { lists, isLoading } = useSavedLists();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-(--spacing-page-x) py-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!lists.length) {
    return (
      <div className="px-(--spacing-page-x) py-4">
        <EmptyState
          icon="🔖"
          title="Nenhuma lista salva"
          description="Explore listas e salve as que gostar."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-(--spacing-page-x) py-4">
      {lists.map((list) => (
        <ListCard key={list.id} list={list} />
      ))}
    </div>
  );
}

export default function ListsPage() {
  return (
    <main className="flex h-dvh flex-col bg-bg-subtle pb-16">
      <PageHeader title="Listas" />

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
