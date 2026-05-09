import { SectionHeader } from './SectionHeader';
import { DestaqueScroll } from './DestaqueScroll';
import type { ListSummaryDTO } from '@/application/dtos/ListDTO';

interface DestaqueSectionProps {
  lists: ListSummaryDTO[];
}

export function DestaqueSection({ lists }: DestaqueSectionProps) {
  if (lists.length === 0) return null;

  return (
    <section>
      <SectionHeader title="Em Destaque" />
      <DestaqueScroll lists={lists} />
    </section>
  );
}
