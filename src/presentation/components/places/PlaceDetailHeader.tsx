'use client';

import { useState } from 'react';
import { useDistance } from '@/presentation/hooks/useDistance';
import { useFavorites } from '@/presentation/hooks/useFavorites';
import { useLists } from '@/presentation/hooks/useLists';
import { DynamicPlaceDetailMap } from '@/presentation/components/maps/dynamic';
import { Sheet } from '@/presentation/components/ui/Sheet';

interface PlaceDetailHeaderProps {
  lat: number;
  lng: number;
  name: string;
  placeId: string;
}

export function PlaceDetailHeader({ lat, lng, name, placeId }: PlaceDetailHeaderProps) {
  const { distanceText, hasUserLocation } = useDistance(lat, lng);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const { isFavorited, toggle: toggleFavorite, isLoading: isFavLoading } = useFavorites();
  const { lists, isLoading: isLoadingLists } = useLists();
  const [isToggling, setIsToggling] = useState(false);
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const [addingToListId, setAddingToListId] = useState<string | null>(null);

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

      setListSheetOpen(false);
    } catch (err) {
      console.error('Erro ao adicionar à lista:', err);
    } finally {
      setAddingToListId(null);
    }
  };

  return (
    <>
      <div className="relative h-[150px] w-full overflow-hidden">
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
              <span className="text-xs font-semibold">{distanceText} de você</span>
            </div>
          </div>
        )}

        {/* Ícones de ações - topo direito */}
        <div className="absolute right-3 top-3 z-900 flex gap-2">
          {/* Compartilhar */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105"
            aria-label="Compartilhar"
          >
            <svg
              className="h-5 w-5 text-text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>

          {/* Adicionar a lista */}
          <button
            type="button"
            onClick={() => setListSheetOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105"
            aria-label="Adicionar a lista"
          >
            <svg
              className="h-5 w-5 text-text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>

          {/* Favoritar */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={isFavLoading || isToggling}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105 disabled:opacity-50"
            aria-label={favorited ? 'Desfavoritar' : 'Favoritar'}
          >
            <svg
              className="h-5 w-5"
              fill={favorited ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: favorited ? '#ef4444' : 'currentColor' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Botão "Como chegar" - parte inferior direita */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 z-1000 flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          Como chegar
        </a>
      </div>

      {/* Sheet de adicionar a lista */}
      <Sheet
        open={listSheetOpen}
        onClose={() => setListSheetOpen(false)}
        title="Adicionar a uma lista"
      >
        <div className="space-y-3">
          {isLoadingLists ? (
            <p className="text-sm text-text-secondary">Carregando...</p>
          ) : lists && lists.length > 0 ? (
            lists.map((list) => (
              <button
                key={list.id}
                onClick={() => handleAddToList(list.id)}
                disabled={addingToListId === list.id}
                className="w-full rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-background-secondary disabled:opacity-50"
              >
                <p className="font-medium text-text-primary">{list.name}</p>
                {list.description && (
                  <p className="mt-1 text-xs text-text-secondary">{list.description}</p>
                )}
              </button>
            ))
          ) : (
            <p className="text-sm text-text-secondary">Você ainda não tem listas.</p>
          )}
        </div>
      </Sheet>
    </>
  );
}
