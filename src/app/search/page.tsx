'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHideTopBar } from '@/presentation/contexts/TopBarContext';
import { SearchTopbar } from '@/presentation/components/layout/SearchTopbar';
import { SearchRecentList } from '@/presentation/components/search/SearchRecentList';
import { addRecentSearch } from '@/presentation/lib/recentSearches';
import { SearchResults } from '@/presentation/components/search/SearchResults';
import { useSearch } from '@/presentation/hooks/useSearch';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { places, lists, isLoading } = useSearch(query);

  useHideTopBar();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSelect = useCallback((term: string) => {
    setQuery(term);
    addRecentSearch(term);
  }, []);

  const handleChange = useCallback((v: string) => {
    setQuery(v);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-bg" style={{ paddingTop: 'var(--topbar-height)' }}>
      <SearchTopbar value={query} onChange={handleChange} onBack={handleBack} />

      <div className="flex-1 overflow-y-auto">
        {query.trim().length < 2 ? (
          <SearchRecentList onSelect={handleSelect} />
        ) : (
          <SearchResults places={places} lists={lists} isLoading={isLoading} query={query} />
        )}
      </div>
    </div>
  );
}
