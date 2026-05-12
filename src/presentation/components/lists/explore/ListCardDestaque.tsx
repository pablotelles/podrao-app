'use client';

import { List, MapPin, Bookmark } from 'lucide-react';
import type { ListSummaryDTO } from '@/application/dtos/ListDTO';
import { priceText } from '@/presentation/lib/listFormatters';
import { Text } from '@/presentation/components/ui/Text';

interface ListCardDestaqueProps {
  list: ListSummaryDTO;
  /** When provided, renders "por {curatorName}" below the metadata row */
  curatorName?: string;
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
        <Text
          as="p"
          variant="body-strong"
          className="absolute bottom-2.5 left-3 right-3 leading-snug"
          style={{
            color: list.coverUrl ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
          }}
        >
          {list.title}
        </Text>
      </div>

      <div className="px-3 pb-3 pt-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {list.bairro && (
            <Text
              as="span"
              variant="caption"
              textColor="secondary"
              className="flex items-center gap-1"
            >
              <MapPin size={12} strokeWidth={1.8} />
              {list.bairro}
            </Text>
          )}
          {list.bairro && <span className="h-0.75 w-0.75 rounded-full bg-text-disabled" />}
          <Text
            as="span"
            variant="caption"
            textColor="secondary"
            className="flex items-center gap-1"
          >
            <MapPin size={11} strokeWidth={1.8} />
            {placesLabel}
          </Text>
          <span className="h-0.75 w-0.75 rounded-full bg-text-disabled" />
          <Text
            as="span"
            variant="caption"
            textColor="secondary"
            className="flex items-center gap-1"
          >
            <Bookmark size={11} strokeWidth={1.8} />
            {list.savesCount}
          </Text>
          {price && (
            <>
              <span className="h-0.75 w-0.75 rounded-full bg-text-disabled" />
              <Text as="span" variant="label" textColor="success">
                {price}
              </Text>
            </>
          )}
        </div>
      </div>
    </a>
  );
}
