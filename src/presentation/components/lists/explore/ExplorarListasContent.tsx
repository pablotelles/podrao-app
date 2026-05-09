'use client';

import { useGeolocation } from '@/presentation/hooks/useGeolocation';
import { useFeaturedLists } from '@/presentation/hooks/useFeaturedLists';
import { useRecentLists } from '@/presentation/hooks/useRecentLists';
import { ExplorarListasSkeleton } from './ExplorarListasSkeleton';
import { DestaqueSection } from './DestaqueSection';
import { RecentesSection } from './RecentesSection';
import { CriarListaFAB } from './CriarListaFAB';
import { LocationHint } from '@/presentation/components/ui/LocationHint';

export function ExplorarListasContent() {
  const geo = useGeolocation();
  const locationGranted = geo.lat !== null && geo.lng !== null;

  const { items: featured, isLoading: featuredLoading } = useFeaturedLists();
  const {
    items: recent,
    isLoading: recentLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = useRecentLists({
    lat: geo.lat,
    lng: geo.lng,
  });

  const isLoading = featuredLoading || (recentLoading && recent.length === 0);

  if (geo.initializing || isLoading) {
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

      {!locationGranted && !geo.loading && <LocationHint onAllow={geo.request} />}

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
