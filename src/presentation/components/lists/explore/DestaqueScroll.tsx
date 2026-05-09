import { ListCardDestaque } from './ListCardDestaque';
import type { ListSummaryDTO } from '@/application/dtos/ListDTO';

interface DestaqueScrollProps {
  lists: ListSummaryDTO[];
}

export function DestaqueScroll({ lists }: DestaqueScrollProps) {
  return (
    <div
      role="list"
      className="flex overflow-x-auto pb-(--spacing-card-gap) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{
        gap: 'var(--spacing-card-gap)',
        padding: `0 var(--spacing-page-x) var(--spacing-card-gap)`,
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {lists.map((list) => (
        <div key={list.id} role="listitem">
          <ListCardDestaque list={list} />
        </div>
      ))}
    </div>
  );
}
