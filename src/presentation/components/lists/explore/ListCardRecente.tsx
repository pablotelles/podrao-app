'use client';

import { List, MapPin } from 'lucide-react';
import type { ListSummaryDTO } from '@/application/dtos/ListDTO';
import { savesTextShort, priceText } from '@/presentation/lib/listFormatters';

interface ListCardRecenteProps {
  list: ListSummaryDTO;
}

function relativeDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'há 1 dia';
  return `há ${diffDays} dias`;
}

export function ListCardRecente({ list }: ListCardRecenteProps) {
  const price = priceText(list.priceRangeMin, list.priceRangeMax);
  const placesLabel = `${list.lugaresCount} lugar${list.lugaresCount !== 1 ? 'es' : ''}`;

  return (
    <a
      href={`/lists/${list.id}`}
      aria-label={`Ver lista: ${list.title}`}
      className="flex overflow-hidden rounded-md bg-bg-card shadow-(--shadow-card)"
    >
      <div className="relative shrink-0 overflow-hidden bg-bg-subtle" style={{ width: '88px' }}>
        {list.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={list.coverUrl}
            alt={list.title}
            className="h-full w-full object-cover"
            style={{ minHeight: '88px' }}
          />
        ) : (
          <div className="flex h-full min-h-22 w-full items-center justify-center bg-bg-subtle">
            <List size={24} className="text-text-disabled" strokeWidth={1.4} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <p className="truncate text-sm font-semibold text-text-primary">{list.title}</p>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {list.bairro && (
            <span className="flex items-center gap-1 text-[0.6875rem] text-text-secondary">
              <MapPin size={11} strokeWidth={1.8} />
              {list.bairro}
            </span>
          )}
          {list.bairro && (
            <span
              className="inline-block rounded-full bg-text-disabled"
              style={{ width: '2.5px', height: '2.5px' }}
            />
          )}
          <span className="text-[0.6875rem] text-text-secondary">{placesLabel}</span>
          {price && (
            <>
              <span
                className="inline-block rounded-full bg-text-disabled"
                style={{ width: '2.5px', height: '2.5px' }}
              />
              <span className="text-[0.6875rem] font-medium text-success">{price}</span>
            </>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[0.6875rem] text-text-disabled">
            {relativeDate(list.updatedAt)}
          </span>
          <span className="text-[0.6875rem] text-text-secondary">
            {savesTextShort(list.savesCount)}
          </span>
        </div>
      </div>
    </a>
  );
}
