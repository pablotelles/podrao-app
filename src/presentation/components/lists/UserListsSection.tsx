'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useLists } from '@/presentation/hooks/useLists';
import { ListsSection } from './ListsSection';

export function UserListsSection() {
  const router = useRouter();
  const { lists, isLoading, error, refresh } = useLists();

  return (
    <ListsSection
      title="Minhas Listas"
      lists={lists}
      isLoading={isLoading}
      error={error}
      onRetry={refresh}
      headerAction={
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-medium text-brand"
          onClick={() => router.push('/lists/new')}
        >
          <Plus size={14} />
          Nova lista
        </button>
      }
      emptyTitle="Nenhuma lista criada"
      emptyDescription="Crie sua primeira lista e compartilhe com amigos."
    />
  );
}
