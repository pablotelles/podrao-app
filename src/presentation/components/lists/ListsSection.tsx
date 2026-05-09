'use client';

import type { ReactNode } from 'react';
import { EmptyState, Skeleton } from '@/presentation/components/ui';
import { SectionShell } from '@/presentation/components/profile/SectionShell';
import { ListCard } from './ListCard';
import type { UserList } from '@/domain/entities/List';

interface ListsSectionProps {
  lists: UserList[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onMenuClick?: (list: UserList) => void;
  /** Limita a N itens exibidos */
  limit?: number;

  // SectionShell (somente quando title é fornecido)
  title?: string;
  headerAction?: ReactNode;
  footerLink?: { label: string; href: string };

  // Customização do estado vazio
  emptyTitle?: string;
  emptyDescription?: string;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 border-b border-bg-subtle py-3 last:border-b-0">
      <Skeleton className="h-14 w-14 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 w-40 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
    </div>
  );
}

function Content({
  lists,
  isLoading,
  error,
  onRetry,
  onMenuClick,
  limit,
  emptyTitle,
  emptyDescription,
}: Pick<
  ListsSectionProps,
  | 'lists'
  | 'isLoading'
  | 'error'
  | 'onRetry'
  | 'onMenuClick'
  | 'limit'
  | 'emptyTitle'
  | 'emptyDescription'
>) {
  if (isLoading) {
    return (
      <div className="flex flex-col">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-error">Não foi possível carregar as listas.</p>
        {onRetry && (
          <button type="button" className="text-sm font-medium text-brand" onClick={onRetry}>
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (!lists.length) {
    return (
      <EmptyState
        icon="📋"
        title={emptyTitle ?? 'Nenhuma lista encontrada'}
        description={emptyDescription ?? 'Crie sua primeira lista para organizar seus lugares.'}
      />
    );
  }

  const displayed = limit ? lists.slice(0, limit) : lists;
  return (
    <div className="flex flex-col">
      {displayed.map((list) => (
        <ListCard key={list.id} list={list} onMenuClick={onMenuClick} />
      ))}
    </div>
  );
}

export function ListsSection({
  lists,
  isLoading,
  error,
  onRetry,
  onMenuClick,
  limit,
  title,
  headerAction,
  footerLink,
  emptyTitle,
  emptyDescription,
}: ListsSectionProps) {
  const content = (
    <Content
      lists={lists}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onMenuClick={onMenuClick}
      limit={limit}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
    />
  );

  if (title) {
    return (
      <SectionShell title={title} headerAction={headerAction} footerLink={footerLink}>
        {content}
      </SectionShell>
    );
  }

  return <div className="flex flex-col px-(--spacing-page-x)">{content}</div>;
}
