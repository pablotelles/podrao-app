'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { ListCardRecente } from './ListCardRecente';
import { RecentesEmptyState } from './RecentesEmptyState';
import type { ListSummaryDTO } from '@/application/dtos/ListDTO';

interface RecentesSectionProps {
  items: ListSummaryDTO[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  locationGranted: boolean;
  onLoadMore: () => void;
}

export function RecentesSection({
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  locationGranted,
  onLoadMore,
}: RecentesSectionProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  const title = locationGranted ? 'Recentes perto de você' : 'Recentes';
  const subtitle = locationGranted ? 'últimos 30 dias' : undefined;

  return (
    <section>
      <SectionHeader title={title} subtitle={subtitle} />

      {!isLoading && items.length === 0 && !hasMore ? (
        <RecentesEmptyState />
      ) : (
        <div
          className="flex flex-col pb-4"
          style={{ gap: 'var(--spacing-card-gap)', padding: '0 var(--spacing-page-x) 1rem' }}
        >
          {items.map((list) => (
            <ListCardRecente key={list.id} list={list} />
          ))}
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-1" />}

      {isLoadingMore && (
        <div className="flex justify-center py-5">
          <Loader2 size={20} className="animate-spin text-brand" />
        </div>
      )}
    </section>
  );
}
