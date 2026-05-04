import type { UserList } from '@/domain/entities/List';
import { ListRow } from './ListRow';
import { ListCard } from './ListCard';
import { EmptyState, Skeleton } from '@/presentation/components/ui';

interface ListListProps {
  lists: UserList[];
  isLoading: boolean;
  error?: Error | null;
  direction?: 'vertical' | 'horizontal';
  onMenuClick?: (list: UserList) => void;
  onDelete?: (list: UserList) => void;
}

function ListRowSkeleton() {
  return (
    <div className="flex items-stretch gap-0 rounded-xl border border-border bg-bg overflow-hidden min-h-[88px]">
      <Skeleton className="w-24 shrink-0" />
      <div className="flex flex-1 flex-col gap-2 px-4 py-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="flex items-center pr-4">
        <Skeleton className="h-5 w-5 shrink-0" />
      </div>
    </div>
  );
}

export function ListList({
  lists,
  isLoading,
  error,
  direction = 'vertical',
  onMenuClick,
  onDelete,
}: ListListProps) {
  if (isLoading) {
    if (direction === 'horizontal') {
      return (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-64 shrink-0">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Erro ao carregar listas"
        description="Tente novamente em alguns instantes."
      />
    );
  }

  if (!lists.length) {
    return (
      <EmptyState
        icon="📋"
        title="Nenhuma lista encontrada"
        description="Crie sua primeira lista para organizar seus lugares favoritos."
      />
    );
  }

  if (direction === 'horizontal') {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {lists.map((list) => (
          <div key={list.id} className="w-64 shrink-0">
            <ListCard list={list} onDelete={onDelete ? () => onDelete(list) : undefined} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {lists.map((list) => (
        <ListRow key={list.id} list={list} onMenuClick={onMenuClick} />
      ))}
    </div>
  );
}
