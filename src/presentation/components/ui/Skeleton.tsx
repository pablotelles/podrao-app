import type { HTMLAttributes } from 'react';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return <div className={['animate-pulse rounded-md bg-border', className].join(' ')} {...props} />;
}

export function PlaceCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

/** Matches PlaceCardHome — 160px wide, 96px photo */
export function PlaceCardHomeSkeleton() {
  return (
    <div
      className="flex-none overflow-hidden rounded-md bg-bg-card shadow-(--shadow-card)"
      style={{ width: '160px', scrollSnapAlign: 'start' }}
    >
      <Skeleton className="rounded-none" style={{ height: '96px' }} />
      <div className="flex flex-col gap-1.5 px-2.5 pb-2.5 pt-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/** Matches ListCardDestaque — 260px wide, 148px photo */
export function ListCardSkeleton() {
  return (
    <div
      className="flex-none overflow-hidden rounded-lg bg-bg-card shadow-(--shadow-card)"
      style={{ width: '260px', scrollSnapAlign: 'start' }}
    >
      <Skeleton className="rounded-none" style={{ height: '148px' }} />
      <div className="flex flex-col gap-2 px-3 pb-3 pt-2.5">
        <div className="flex gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
