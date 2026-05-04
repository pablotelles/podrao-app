'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MoreHorizontal, Globe, Lock, ChevronRight } from 'lucide-react';
import type { UserList } from '@/domain/entities/List';

interface ListRowProps {
  list: UserList;
  onMenuClick?: (list: UserList) => void;
}

function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);

  if (days === 0) return 'Atualizada hoje';
  if (days === 1) return 'Atualizada há 1 dia';
  if (days < 7) return `Atualizada há ${days} dias`;
  if (weeks === 1) return 'Atualizada há 1 semana';
  if (weeks < 4) return `Atualizada há ${weeks} semanas`;
  return `Atualizada há ${Math.floor(weeks / 4)} ${Math.floor(weeks / 4) === 1 ? 'mês' : 'meses'}`;
}

export function ListRow({ list, onMenuClick }: ListRowProps) {
  const placesText =
    list.placesCount === 0
      ? '0 lugares'
      : list.placesCount === 1
        ? '1 lugar'
        : `${list.placesCount} lugares`;

  return (
    <div className="flex items-stretch gap-0 bg-bg rounded-xl border border-border overflow-hidden shadow-(--shadow-card)">
      {/* Cover */}
      <Link href={`/lists/${list.id}`} className="relative shrink-0">
        <div className="relative h-full w-24 bg-bg-subtle">
          {list.coverUrl ? (
            <Image src={list.coverUrl} alt={list.name} fill className="object-cover" sizes="96px" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-brand-subtle">
              <span className="text-3xl">📋</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <Link href={`/lists/${list.id}`} className="flex-1 min-w-0 px-4 py-3">
        <p className="font-semibold text-text-primary leading-tight truncate">{list.name}</p>
        <p className="mt-0.5 text-xs text-text-secondary flex items-center gap-1.5">
          <span>{placesText}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            {list.isPublic ? (
              <>
                <Globe size={12} />
                <span>Pública</span>
              </>
            ) : (
              <>
                <Lock size={12} />
                <span>Privada</span>
              </>
            )}
          </span>
        </p>
        <p className="mt-0.5 text-xs text-text-secondary">{getRelativeTime(list.updatedAt)}</p>
      </Link>

      {/* Ações */}
      <div className="flex shrink-0 items-center gap-2 pr-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            onMenuClick?.(list);
          }}
          className="text-text-disabled hover:text-text-secondary"
          aria-label="Opções"
        >
          <MoreHorizontal size={18} />
        </button>
        <Link
          href={`/lists/${list.id}`}
          className="text-text-disabled hover:text-text-secondary"
          aria-label="Ver lista"
        >
          <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
}
