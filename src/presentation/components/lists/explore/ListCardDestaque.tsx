'use client';

import { List, MapPin } from 'lucide-react';
import type { ListSummaryDTO } from '@/application/dtos/ListDTO';
import { savesTextLong, priceText } from '@/presentation/lib/listFormatters';

interface ListCardDestaqueProps {
  list: ListSummaryDTO;
}

export function ListCardDestaque({ list }: ListCardDestaqueProps) {
  const price = priceText(list.priceRangeMin, list.priceRangeMax);
  const placesLabel = `${list.lugaresCount} lugar${list.lugaresCount !== 1 ? 'es' : ''}`;

  return (
    <a
      href={`/lists/${list.id}`}
      aria-label={`Ver lista: ${list.title}`}
      className="block flex-none overflow-hidden rounded-lg bg-bg-card shadow-(--shadow-card)"
      style={{ width: '260px', scrollSnapAlign: 'start' }}
    >
      <div className="relative" style={{ height: '148px' }}>
        {list.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={list.coverUrl} alt={list.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-bg-subtle">
            <List size={32} className="text-text-disabled" strokeWidth={1.4} />
          </div>
        )}
        {list.coverUrl && (
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, transparent 30%, var(--color-overlay-gradient) 100%)',
            }}
          />
        )}
        <p
          className="absolute bottom-2.5 left-3 right-3 text-[0.9375rem] font-bold leading-snug"
          style={{
            color: list.coverUrl ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
          }}
        >
          {list.title}
        </p>
      </div>

      <div className="px-3 pb-3 pt-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {list.bairro && (
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <MapPin size={12} strokeWidth={1.8} />
              {list.bairro}
            </span>
          )}
          {list.bairro && <span className="h-0.75 w-0.75 rounded-full bg-text-disabled" />}
          <span className="text-xs text-text-secondary">{placesLabel}</span>
          {price && (
            <>
              <span className="h-0.75 w-0.75 rounded-full bg-text-disabled" />
              <span className="text-xs font-medium text-success">{price}</span>
            </>
          )}
        </div>
        <p className="mt-1 text-[0.6875rem] text-text-secondary">
          {savesTextLong(list.savesCount)}
        </p>
      </div>
    </a>
  );
}
