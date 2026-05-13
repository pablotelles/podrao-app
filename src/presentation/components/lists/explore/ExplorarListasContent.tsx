'use client';

import { useUserLocation } from '@/presentation/hooks/useUserLocation';
import { useFeaturedLists } from '@/presentation/hooks/useFeaturedLists';
import { useRecentLists } from '@/presentation/hooks/useRecentLists';
import { ExplorarListasSkeleton } from './ExplorarListasSkeleton';
import { DestaqueSection } from './DestaqueSection';
import { RecentesSection } from './RecentesSection';
import { CriarListaFAB } from './CriarListaFAB';
import { LocationHint } from '@/presentation/components/ui/LocationHint';

export function ExplorarListasContent() {
  const { location, initializing, isLoading: geoLoading, requestLocation } = useUserLocation();
  const locationGranted = location !== null;

  const { items: featured, isLoading: featuredLoading } = useFeaturedLists();
  const {
    items: recent,
    isLoading: recentLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = useRecentLists({
    lat: location?.lat ?? null,
    lng: location?.lng ?? null,
  });

  const isLoading = featuredLoading || (recentLoading && recent.length === 0);

  if (initializing || isLoading) {
    return (
      <>
        <ExplorarListasSkeleton />
        <CriarListaFAB />
      </>
    );
  }

  return (
    <>
      <DestaqueSection lists={featured} />

      {!locationGranted && !geoLoading && <LocationHint onAllow={requestLocation} />}

      <RecentesSection
        items={recent}
        isLoading={recentLoading && recent.length === 0}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        locationGranted={locationGranted}
        onLoadMore={loadMore}
      />

      <CriarListaFAB />
    </>
  );
}
