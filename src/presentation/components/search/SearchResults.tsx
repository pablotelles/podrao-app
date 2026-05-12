'use client';

import Link from 'next/link';
import type { Place } from '@/domain/entities/Place';
import type { UserList } from '@/domain/entities/List';
import { PlaceCard } from '@/presentation/components/places/PlaceCard';
import { ListCard } from '@/presentation/components/lists/ListCard';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Button } from '@/presentation/components/ui/Button';
import { Text } from '@/presentation/components/ui/Text';

interface SearchResultsProps {
  places: Place[];
  lists: UserList[];
  isLoading: boolean;
  query: string;
}

function PlaceSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-bg-subtle last:border-b-0">
      <Skeleton className="h-14 w-14 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-bg-subtle last:border-b-0">
      <Skeleton className="h-14 w-14 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function SearchResults({ places, lists, isLoading, query }: SearchResultsProps) {
  if (!query || query.trim().length < 2) return null;

  if (isLoading) {
    return (
      <div className="px-(--spacing-page-x)">
        <Text
          as="p"
          variant="label"
          textColor="secondary"
          className="mb-2 py-2 uppercase tracking-wide"
        >
          Lugares
        </Text>
        <PlaceSkeleton />
        <PlaceSkeleton />
        <PlaceSkeleton />

        <Text
          as="p"
          variant="label"
          textColor="secondary"
          className="mb-2 mt-4 py-2 uppercase tracking-wide"
        >
          Listas
        </Text>
        <ListSkeleton />
        <ListSkeleton />
      </div>
    );
  }

  const hasNoResults = places.length === 0 && lists.length === 0;

  if (hasNoResults) {
    return (
      <div className="px-(--spacing-page-x)">
        <EmptyState
          title="Nenhum resultado"
          description={`Nenhum lugar ou lista encontrado para "${query}"`}
          action={
            <Link href="/add-place">
              <Button variant="primary" size="sm">
                Cadastrar este lugar
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-(--spacing-page-x)">
      {places.length > 0 && (
        <section className="mb-4">
          <Text
            as="h2"
            variant="label"
            textColor="secondary"
            className="py-2 uppercase tracking-wide"
          >
            Lugares
          </Text>
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} standalone={false} />
          ))}
        </section>
      )}

      {lists.length > 0 && (
        <section>
          <Text
            as="h2"
            variant="label"
            textColor="secondary"
            className="py-2 uppercase tracking-wide"
          >
            Listas
          </Text>
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </section>
      )}
    </div>
  );
}
