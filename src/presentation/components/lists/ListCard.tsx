'use client';

import type { UserList } from '@/domain/entities/List';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';

interface ListCardProps {
  list: UserList;
  onClick?: () => void;
  onDelete?: () => void;
}

export function ListCard({ list, onClick, onDelete }: ListCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-(--shadow-card-hover) transition-shadow">
      <div onClick={onClick} className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
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
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="ml-3 text-text-secondary hover:text-red-600"
              aria-label="Deletar lista"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
