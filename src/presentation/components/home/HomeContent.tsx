'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Map } from 'lucide-react';
import useSWR from 'swr';
import { useGeolocation } from '@/presentation/hooks/useGeolocation';
import { useNearbyPlaces } from '@/presentation/hooks/useNearbyPlaces';
import { useFeaturedLists } from '@/presentation/hooks/useFeaturedLists';
import { useLists } from '@/presentation/hooks/useLists';
import { useSubHeaderHeight } from '@/presentation/hooks/useSubHeaderHeight';
import { LocationBar } from '@/presentation/components/home/LocationBar';
import { PlaceCardHome } from '@/presentation/components/home/PlaceCardHome';
import { PlaceCardContribute } from '@/presentation/components/home/PlaceCardContribute';
import { PlaceCardSparseInvite } from '@/presentation/components/home/PlaceCardSparseInvite';
import { FilterBar, type FilterValues } from '@/presentation/components/filters/FilterBar';
import { useSearchRadius } from '@/presentation/hooks/useSearchRadius';
import { ContributeBlock } from '@/presentation/components/home/ContributeBlock';
import { ListCardDestaque } from '@/presentation/components/lists/explore/ListCardDestaque';
import { SectionHeader } from '@/presentation/components/lists/explore/SectionHeader';
import { MapSkeleton } from '@/presentation/components/maps/MapSkeleton';
import { PlaceCardHomeSkeleton, ListCardSkeleton } from '@/presentation/components/ui/Skeleton';
import { usePageTitle } from '@/presentation/contexts/TopBarContext';

interface HomeContentProps {
  initialLat?: number | null;
  initialLng?: number | null;
}

const SPARSE_THRESHOLD = 3;

type ReverseGeocodeResult = {
  displayName: string;
  address?: { road?: string; neighbourhood?: string; city?: string; state?: string };
};

async function reverseGeocodeFetcher(url: string): Promise<ReverseGeocodeResult> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Reverse geocode failed');
  return res.json() as Promise<ReverseGeocodeResult>;
}

function buildReverseUrl(lat: number | null, lng: number | null): string | null {
  if (lat == null || lng == null) return null;
  return `/api/geocode/reverse?lat=${lat}&lng=${lng}`;
}

export function HomeContent({ initialLat, initialLng }: HomeContentProps) {
  usePageTitle('Inicio');
  // Never show a subheader on the new home
  useSubHeaderHeight(0);

  const geo = useGeolocation();
  const router = useRouter();

  const { radius, setRadius } = useSearchRadius();
  const [filters, setFilters] = useState<Omit<FilterValues, 'radiusMeters'>>({});
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const filterValues: FilterValues = { ...filters, radiusMeters: radius };

  function handleFiltersChange(next: FilterValues) {
    const { radiusMeters, ...rest } = next;
    if (radiusMeters !== undefined) setRadius(radiusMeters);
    setFilters(rest);
  }

  /**
   * Derives attributeKey + attributeValue from contextual filters.
   * Priority order: service_type > food_tags > bar_focus > drink_tags >
   *                 has_happy_hour > specialty_tags > opens_early
   */
  function deriveAttributeFilter(ctx: FilterValues['contextual']): {
    attributeKey?: string;
    attributeValue?: string;
  } {
    if (!ctx) return {};
    if (ctx.serviceType) return { attributeKey: 'service_type', attributeValue: ctx.serviceType };
    if (ctx.foodTag) return { attributeKey: 'food_tags', attributeValue: ctx.foodTag };
    if (ctx.barFocus) return { attributeKey: 'bar_focus', attributeValue: ctx.barFocus };
    if (ctx.drinkTag) return { attributeKey: 'drink_tags', attributeValue: ctx.drinkTag };
    if (ctx.hasHappyHour) return { attributeKey: 'has_happy_hour', attributeValue: 'true' };
    if (ctx.specialtyTag)
      return { attributeKey: 'specialty_tags', attributeValue: ctx.specialtyTag };
    if (ctx.opensEarly) return { attributeKey: 'opens_early', attributeValue: 'true' };
    return {};
  }

  const hasLocation = geo.lat != null && geo.lng != null;

  // Apply initial location from onboarding (city-search path)
  useEffect(() => {
    if (!geo.initializing && geo.lat == null && initialLat != null && initialLng != null) {
      geo.setLocation(initialLat, initialLng);
    }
  }, [geo.initializing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reverse geocode for LocationBar label
  const { data: reverseData } = useSWR<ReverseGeocodeResult>(
    buildReverseUrl(geo.lat, geo.lng),
    reverseGeocodeFetcher,
    { revalidateOnFocus: false },
  );

  const locationLabel: string | null = reverseData
    ? [reverseData.address?.road, reverseData.address?.neighbourhood, reverseData.address?.city]
        .filter(Boolean)
        .join(', ') || reverseData.displayName
    : null;

  const radiusLabel = radius < 1000 ? `${radius}m` : `${radius / 1000}km`;

  // Nearby places — Zona B
  const maxPrice = filters.priceBucket
    ? (
        { up_to_25: 25, '25_to_45': 45, '45_to_80': 80, above_80: undefined } as Record<
          string,
          number | undefined
        >
      )[filters.priceBucket]
    : undefined;

  const attributeFilter = deriveAttributeFilter(filters.contextual);

  const { places, isLoading: placesLoading } = useNearbyPlaces(
    hasLocation
      ? {
          lat: geo.lat!,
          lng: geo.lng!,
          radiusMeters: radius,
          period: filters.period,
          establishmentType: filters.establishmentType,
          attributeKey: attributeFilter.attributeKey,
          attributeValue: attributeFilter.attributeValue,
          maxPrice,
        }
      : null,
  );

  const isSparse = !placesLoading && places.length < SPARSE_THRESHOLD;

  // Zona C — featured community lists
  const { items: featuredLists, isLoading: featuredListsLoading } = useFeaturedLists();

  // Zona D — user's own lists (only when authenticated, useLists returns [] when not)
  const { lists: myLists } = useLists();

  return (
    <>
      {/* Full-height skeleton while geolocation initializes */}
      {geo.initializing && (
        <div style={{ height: 'calc(100dvh - var(--topbar-height))' }}>
          <MapSkeleton />
        </div>
      )}

      {!geo.initializing && (
        <div
          className="overflow-y-auto pb-20"
          style={{ minHeight: 'calc(100dvh - var(--topbar-height))' }}
        >
          {/* ── ZONA A — Location context ── */}
          <div className="bg-bg">
            <LocationBar
              locationLabel={locationLabel}
              loading={geo.loading}
              currentLat={geo.lat}
              currentLng={geo.lng}
              onLocationSearch={(lat, lng) => geo.setLocation(lat, lng)}
              onRetryGps={geo.request}
            />
          </div>

          {/* ── ZONA B — Nearby places (conditional on location) ── */}
          {hasLocation && (
            <section aria-label="Lugares próximos" className="mt-5">
              <SectionHeader
                title="Perto de você"
                badge={radiusLabel}
                onFilterClick={() => setFilterSheetOpen(true)}
              />

              <div
                className="flex gap-(--spacing-card-gap) overflow-x-auto px-(--spacing-page-x) pb-1"
                style={{
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                }}
                role="list"
                aria-busy={placesLoading}
              >
                {placesLoading ? (
                  Array.from({ length: 5 }, (_, i) => <PlaceCardHomeSkeleton key={i} />)
                ) : (
                  <>
                    {places.map((place) => (
                      <PlaceCardHome key={place.id} place={place} />
                    ))}
                    {isSparse && <PlaceCardSparseInvite />}
                    {!isSparse && <PlaceCardContribute />}
                  </>
                )}
              </div>

              {/* CTA — see all on map */}
              <a
                href="/map"
                className="flex items-center gap-1.5 px-(--spacing-page-x) pt-2.5"
                style={{ fontSize: 'var(--font-size-label)' }}
                aria-label="Ver todos os lugares no mapa"
              >
                <Map size={14} className="text-brand" />
                <span className="font-medium text-brand">Ver todos no mapa</span>
              </a>
            </section>
          )}

          {/* Divider */}
          <div className="mx-(--spacing-page-x) mt-5 h-px bg-border opacity-50" />

          {/* ── ZONA C — Community lists ── */}
          <section aria-label="Listas da comunidade">
            <SectionHeader
              title="Listas da comunidade"
              cta={{ label: 'Ver todas', href: '/lists' }}
            />
            {featuredListsLoading ? (
              <div
                className="flex gap-(--spacing-card-gap) overflow-x-auto px-(--spacing-page-x) pb-1"
                style={{
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                }}
                role="list"
                aria-busy
              >
                {Array.from({ length: 3 }, (_, i) => (
                  <ListCardSkeleton key={i} />
                ))}
              </div>
            ) : featuredLists.length > 0 ? (
              <div
                className="flex gap-(--spacing-card-gap) overflow-x-auto px-(--spacing-page-x) pb-1"
                style={{
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                }}
                role="list"
              >
                {featuredLists.map((list) => (
                  <ListCardDestaque key={list.id} list={list} />
                ))}
              </div>
            ) : (
              <p
                className="px-(--spacing-page-x) text-text-secondary"
                style={{ fontSize: 'var(--font-size-label)' }}
              >
                Nenhuma lista em destaque ainda.
              </p>
            )}
          </section>

          {/* ── ZONA D — My saved lists (conditional: user authenticated with lists) ── */}
          {myLists.length > 0 && (
            <>
              <div className="mx-(--spacing-page-x) mt-5 h-px bg-border opacity-50" />
              <section aria-label="Minhas listas">
                <SectionHeader
                  title="Minhas listas"
                  cta={{ label: 'Ver todas', onClick: () => router.push('/lists?tab=salvas') }}
                />
                <div
                  className="flex gap-(--spacing-card-gap) overflow-x-auto px-(--spacing-page-x) pb-1"
                  style={{
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                  }}
                  role="list"
                >
                  {myLists
                    .slice()
                    .sort(
                      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
                    )
                    .map((list) => (
                      <ListCardDestaque
                        key={list.id}
                        list={{
                          id: list.id,
                          title: list.name,
                          coverUrl: list.coverUrl ?? null,
                          bairro: list.bairro ?? '',
                          lugaresCount: list.placesCount ?? 0,
                          savesCount: list.savesCount,
                          priceRangeMin: list.priceRangeMin ?? null,
                          priceRangeMax: list.priceRangeMax ?? null,
                          createdAt:
                            list.createdAt instanceof Date
                              ? list.createdAt.toISOString()
                              : String(list.createdAt),
                          updatedAt:
                            list.updatedAt instanceof Date
                              ? list.updatedAt.toISOString()
                              : String(list.updatedAt),
                        }}
                      />
                    ))}
                </div>
              </section>
            </>
          )}

          {/* ── ZONA E — Contribution invite ── */}
          <ContributeBlock />

          <div style={{ height: '1.5rem' }} />
        </div>
      )}

      {/* Filter Sheet */}
      <FilterBar
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        values={filterValues}
        onChange={handleFiltersChange}
      />
    </>
  );
}
