import type { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={['animate-pulse rounded-md bg-border', className].join(' ')}
      {...props}
    />
  );
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
