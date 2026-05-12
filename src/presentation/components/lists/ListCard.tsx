'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/Badge';
import { Text } from '@/presentation/components/ui/Text';
import type { UserList } from '@/domain/entities/List';

interface ListCardProps {
  list: UserList;
  /** Quando fornecido, exibe MoreHorizontal em vez de ChevronRight */
  onMenuClick?: (list: UserList) => void;
}

function ListThumb({ list }: { list: UserList }) {
  if (list.coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={list.coverUrl}
        alt={list.name}
        className="h-14 w-14 shrink-0 rounded-md object-cover"
      />
    );
  }
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-2xl">
      {list.name.charAt(0).toUpperCase()}
    </div>
  );
}

export function ListCard({ list, onMenuClick }: ListCardProps) {
  const router = useRouter();
  const placesText = list.placesCount === 1 ? '1 lugar' : `${list.placesCount ?? 0} lugares`;

  return (
    <div className="flex w-full items-center gap-3 border-b border-bg-subtle py-3 last:border-b-0">
      <button
        type="button"
        className="flex flex-1 items-center gap-3 text-left"
        onClick={() => router.push(list.slug ? `/lists/${list.slug}` : `/lists/${list.id}`)}
      >
        <ListThumb list={list} />
        <div className="min-w-0 flex-1">
          <Text as="p" variant="label" className="truncate">
            {list.name}
          </Text>
          <div className="mt-0.5 flex items-center gap-1">
            <Text as="span" variant="caption" textColor="secondary">
              {placesText}
            </Text>
            <Text as="span" variant="caption" textColor="secondary">
              ·
            </Text>
            <Badge variant={list.isPublic ? 'success' : 'default'}>
              {list.isPublic ? 'Pública' : 'Privada'}
            </Badge>
          </div>
        </div>
      </button>
      {onMenuClick ? (
        <button
          type="button"
          onClick={() => onMenuClick(list)}
          className="shrink-0 text-text-disabled hover:text-text-secondary"
          aria-label="Opções da lista"
        >
          <MoreHorizontal size={18} />
        </button>
      ) : (
        <ChevronRight size={16} className="shrink-0 text-text-disabled" />
      )}
    </div>
  );
}
