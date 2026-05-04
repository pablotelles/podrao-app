'use client';

import Link from 'next/link';
import type { UserList } from '@/domain/entities/List';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';

interface ListCardProps {
  list: UserList;
  onDelete?: () => void;
}

export function ListCard({ list, onDelete }: ListCardProps) {
  return (
    <Card className="hover:shadow-(--shadow-card-hover) transition-shadow">
      <div className="flex items-start p-4">
        <Link href={`/lists/${list.id}`} className="flex-1">
          <h3 className="font-semibold text-text-primary">{list.name}</h3>
          {list.description && (
            <p className="mt-1 text-sm text-text-secondary line-clamp-2">{list.description}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-text-secondary">
              {list.placesCount ?? 0} {list.placesCount === 1 ? 'lugar' : 'lugares'}
            </span>
            {list.isPublic && <Badge variant="default">Pública</Badge>}
          </div>
        </Link>
        {onDelete && (
          <button
            onClick={onDelete}
            className="ml-3 text-text-secondary hover:text-red-600"
            aria-label="Deletar lista"
          >
            🗑️
          </button>
        )}
      </div>
    </Card>
  );
}
