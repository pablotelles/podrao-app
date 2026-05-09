import { Skeleton } from '@/presentation/components/ui/Skeleton';

export function ExplorarListasSkeleton() {
  return (
    <div>
      {/* Destaque skeleton header */}
      <div className="px-(--spacing-page-x) pb-3 pt-5">
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Destaque skeleton cards */}
      <div
        className="flex gap-(--spacing-card-gap) overflow-hidden"
        style={{ padding: '0 var(--spacing-page-x) var(--spacing-card-gap)' }}
      >
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex-none overflow-hidden rounded-lg shadow-(--shadow-card)"
            style={{ width: '260px' }}
          >
            <Skeleton className="rounded-none" style={{ height: '148px' }} />
            <div className="flex flex-col gap-2 bg-bg-card p-3">
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Recentes skeleton header */}
      <div className="px-(--spacing-page-x) pb-3 pt-5">
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Recentes skeleton cards */}
      <div
        className="flex flex-col"
        style={{ gap: 'var(--spacing-card-gap)', padding: '0 var(--spacing-page-x)' }}
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex overflow-hidden rounded-md shadow-(--shadow-card)">
            <Skeleton className="rounded-none" style={{ width: '88px', height: '88px' }} />
            <div className="flex flex-1 flex-col gap-2 bg-bg-card p-3">
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
