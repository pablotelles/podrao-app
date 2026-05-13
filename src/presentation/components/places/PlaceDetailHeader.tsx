'use client';

import { useState } from 'react';

import { Share2, BookmarkPlus, Heart, Globe, Lock } from 'lucide-react';
import { Text } from '@/presentation/components/ui/Text';
import { useDistance } from '@/presentation/hooks/useDistance';
import { useFavorites } from '@/presentation/hooks/useFavorites';
import { useLists } from '@/presentation/hooks/useLists';
import { DynamicPlaceDetailMap } from '@/presentation/components/maps/dynamic';
import { Sheet } from '@/presentation/components/ui/Sheet';
import { OverlayIconButton } from '@/presentation/components/ui/OverlayIconButton';

interface PlaceDetailHeaderProps {
  lat: number;
  lng: number;
  name: string;
  placeId: string;
  slug?: string | null;
}

export function PlaceDetailHeader({ lat, lng, name, placeId, slug }: PlaceDetailHeaderProps) {
  const { distanceText, hasUserLocation } = useDistance(lat, lng);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const { isFavorited, toggle: toggleFavorite, isLoading: isFavLoading } = useFavorites();
  const { lists, isLoading: isLoadingLists } = useLists();
  const [isToggling, setIsToggling] = useState(false);
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const [addingToListId, setAddingToListId] = useState<string | null>(null);
  const [listsWithPlace, setListsWithPlace] = useState<Set<string>>(new Set());
  const [loadingListsWithPlace, setLoadingListsWithPlace] = useState(false);

  const handleShare = async () => {
    const path = slug ? `/p/${slug}` : `/places/${placeId}`;
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      await navigator.share({ title: name, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const favorited = isFavorited(placeId);

  const handleToggleFavorite = async () => {
    setIsToggling(true);
    try {
      await toggleFavorite(placeId);
    } catch (err) {
      console.error('Erro ao favoritar:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const fetchListsWithPlace = async () => {
    setLoadingListsWithPlace(true);
    try {
      const res = await fetch(`/api/lists/contains?placeId=${placeId}`);
      if (!res.ok) return;
      const { listIds } = (await res.json()) as { listIds: string[] };
      setListsWithPlace(new Set(listIds));
    } catch (err) {
      console.error('Erro ao verificar listas:', err);
    } finally {
      setLoadingListsWithPlace(false);
    }
  };

  const handleOpenListSheet = () => {
    setListSheetOpen(true);
    void fetchListsWithPlace();
  };

  const handleAddToList = async (listId: string) => {
    setAddingToListId(listId);

    try {
      const res = await fetch(`/api/lists/${listId}/places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error ?? 'Erro ao adicionar à lista');
      }

      // Atualiza o estado para marcar que o lugar foi adicionado
      setListsWithPlace((prev) => new Set(prev).add(listId));
    } catch (err) {
      console.error('Erro ao adicionar à lista:', err);
    } finally {
      setAddingToListId(null);
    }
  };

  return (
    <>
      <div className="relative h-50 w-full overflow-hidden" style={{ isolation: 'isolate' }}>
        <DynamicPlaceDetailMap lat={lat} lng={lng} name={name} />

        {/* Distância - canto inferior esquerdo */}
        {hasUserLocation && (
          <div className="absolute bottom-4 left-3 z-900 rounded-lg bg-white px-3 py-2 shadow-md">
            <div className="flex items-center gap-1.5 text-brand">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <Text as="span" variant="label" textColor="brand">
                {distanceText} de você
              </Text>
            </div>
          </div>
        )}

        {/* Ações - topo direito */}
        <div className="absolute right-3 top-3 z-900 flex gap-2">
          <OverlayIconButton
            icon={Share2}
            variant="dark"
            onClick={handleShare}
            aria-label="Compartilhar"
          />

          <OverlayIconButton
            icon={BookmarkPlus}
            variant="dark"
            onClick={handleOpenListSheet}
            aria-label="Adicionar a lista"
          />

          <OverlayIconButton
            icon={Heart}
            iconProps={{
              fill: favorited ? '#ef4444' : 'none',
              stroke: favorited ? '#ef4444' : 'currentColor',
            }}
            variant="dark"
            onClick={handleToggleFavorite}
            disabled={isFavLoading || isToggling}
            aria-label={favorited ? 'Desfavoritar' : 'Favoritar'}
          />
        </div>

        {/* Botão "Como chegar" - parte inferior direita */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 z-1000 flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 shadow-lg transition-transform hover:scale-105"
        >
          <svg
            className="h-4 w-4 text-text-inverse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <Text as="span" variant="body" textColor="inverse">
            Como chegar
          </Text>
        </a>
      </div>

      {/* Sheet de adicionar a lista */}
      <Sheet
        open={listSheetOpen}
        onClose={() => setListSheetOpen(false)}
        title="Adicionar a uma lista"
      >
        <div className="space-y-2">
          {isLoadingLists || loadingListsWithPlace ? (
            <Text as="p" variant="body" textColor="secondary">
              Carregando...
            </Text>
          ) : lists && lists.length > 0 ? (
            lists.map((list) => {
              const alreadyAdded = listsWithPlace.has(list.id);
              return (
                <button
                  key={list.id}
                  onClick={() => handleAddToList(list.id)}
                  disabled={addingToListId === list.id || alreadyAdded}
                  className="w-full rounded-lg border border-border bg-bg p-3 text-left transition-colors hover:bg-bg-subtle disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Text as="p" variant="label">
                    {list.name}
                    {alreadyAdded && (
                      <Text
                        as="span"
                        variant="caption"
                        textColor="success"
                        className="ml-2 font-normal"
                      >
                        ✓ Adicionado
                      </Text>
                    )}
                  </Text>
                  <Text
                    as="p"
                    variant="caption"
                    textColor="secondary"
                    className="mt-1 flex items-center gap-1.5"
                  >
                    <span>
                      {list.placesCount === 0
                        ? '0 lugares'
                        : list.placesCount === 1
                          ? '1 lugar'
                          : `${list.placesCount} lugares`}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {list.isPublic ? (
                        <>
                          <Globe size={12} />
                          <span>Pública</span>
                        </>
                      ) : (
                        <>
                          <Lock size={12} />
                          <span>Privada</span>
                        </>
                      )}
                    </span>
                  </Text>
                </button>
              );
            })
          ) : (
            <Text as="p" variant="body" textColor="secondary">
              Você ainda não tem listas.
            </Text>
          )}
        </div>
      </Sheet>
    </>
  );
}
