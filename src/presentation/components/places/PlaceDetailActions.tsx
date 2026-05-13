'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navigation, Bookmark, Star, Globe, Lock } from 'lucide-react';
import { useLists } from '@/presentation/hooks/useLists';
import { useUser } from '@/presentation/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { Sheet } from '@/presentation/components/ui/Sheet';

interface PlaceDetailActionsProps {
  placeId: string;
  lat: number;
  lng: number;
  canReview: boolean;
}

export function PlaceDetailActions({ placeId, lat, lng, canReview }: PlaceDetailActionsProps) {
  const { user } = useUser();
  const router = useRouter();
  const { lists, isLoading: isLoadingLists } = useLists();
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const [addingToListId, setAddingToListId] = useState<string | null>(null);
  const [listsWithPlace, setListsWithPlace] = useState<Set<string>>(new Set());
  const [loadingListsWithPlace, setLoadingListsWithPlace] = useState(false);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

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
    if (!user) {
      router.push('/login');
      return;
    }
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
        const error = (await res.json()) as { error?: string };
        throw new Error(error.error ?? 'Erro ao adicionar à lista');
      }
      setListsWithPlace((prev) => new Set(prev).add(listId));
    } catch (err) {
      console.error('Erro ao adicionar à lista:', err);
    } finally {
      setAddingToListId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-3 border-b border-border px-4 py-4">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 rounded-xl bg-bg-subtle py-3 transition-opacity hover:opacity-80"
        >
          <Navigation className="h-5 w-5 text-text-primary" />
          <span className="text-xs text-text-secondary">Rotas</span>
        </a>

        <button
          onClick={handleOpenListSheet}
          className="flex flex-col items-center gap-1.5 rounded-xl bg-bg-subtle py-3 transition-opacity hover:opacity-80"
        >
          <Bookmark className="h-5 w-5 text-text-primary" />
          <span className="text-xs text-text-secondary">Salvar</span>
        </button>

        {canReview ? (
          <Link
            href={`/places/${placeId}/review`}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-brand py-3 transition-opacity hover:opacity-90"
          >
            <Star className="h-5 w-5 text-white" />
            <span className="text-xs font-medium text-white">Avaliar</span>
          </Link>
        ) : (
          <div className="flex flex-col items-center gap-1.5 rounded-xl bg-bg-subtle py-3 opacity-40">
            <Star className="h-5 w-5 text-text-secondary" />
            <span className="text-xs text-text-secondary">Avaliar</span>
          </div>
        )}
      </div>

      <Sheet
        open={listSheetOpen}
        onClose={() => setListSheetOpen(false)}
        title="Adicionar a uma lista"
      >
        <div className="space-y-2">
          {isLoadingLists || loadingListsWithPlace ? (
            <p className="text-sm text-text-secondary">Carregando...</p>
          ) : lists && lists.length > 0 ? (
            lists.map((list) => {
              const alreadyAdded = listsWithPlace.has(list.id);
              return (
                <button
                  key={list.id}
                  onClick={() => handleAddToList(list.id)}
                  disabled={addingToListId === list.id || alreadyAdded}
                  className="w-full rounded-lg border border-border bg-bg p-3 text-left transition-colors hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <p className="font-medium text-text-primary">
                    {list.name}
                    {alreadyAdded && (
                      <span className="ml-2 text-xs font-normal text-success">✓ Adicionado</span>
                    )}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
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
                  </p>
                </button>
              );
            })
          ) : (
            <p className="text-sm text-text-secondary">Você ainda não tem listas.</p>
          )}
        </div>
      </Sheet>
    </>
  );
}
