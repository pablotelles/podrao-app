'use client';

import { Clock, ChevronRight } from 'lucide-react';
import { Text } from '@/presentation/components/ui/Text';
import { useLocalStorage } from '@/presentation/hooks/useLocalStorage';
import { RECENT_SEARCHES_KEY } from '@/presentation/lib/recentSearches';

interface SearchRecentListProps {
  onSelect: (term: string) => void;
}

export function SearchRecentList({ onSelect }: SearchRecentListProps) {
  const [recents] = useLocalStorage<string[]>(RECENT_SEARCHES_KEY, []);

  if (recents.length === 0) return null;

  return (
    <div className="px-(--spacing-page-x) py-4">
      <Text as="p" variant="label" textColor="secondary" className="mb-2 uppercase tracking-wide">
        Buscas recentes
      </Text>
      <ul>
        {recents.map((term) => (
          <li key={term}>
            <button
              type="button"
              onClick={() => onSelect(term)}
              className="flex w-full items-center gap-3 border-b border-bg-subtle py-3 text-left last:border-b-0 hover:bg-bg-subtle"
            >
              <Clock className="h-4 w-4 shrink-0 text-text-disabled" aria-hidden="true" />
              <Text as="span" variant="body" className="flex-1 truncate">
                {term}
              </Text>
              <ChevronRight className="h-4 w-4 shrink-0 text-text-disabled" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
