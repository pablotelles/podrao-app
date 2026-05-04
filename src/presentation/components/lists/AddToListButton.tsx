'use client';

import { useState } from 'react';
import { useLists } from '@/presentation/hooks/useLists';
import { Button } from '@/presentation/components/ui/Button';
import { Sheet } from '@/presentation/components/ui/Sheet';
import { CreateListModal } from './CreateListModal';

interface AddToListButtonProps {
  placeId: string;
}

export function AddToListButton({ placeId }: AddToListButtonProps) {
  const { lists, isLoading: isLoadingLists } = useLists();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [addingToListId, setAddingToListId] = useState<string | null>(null);

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

      // TODO: mostrar toast de sucesso
      setSheetOpen(false);
    } catch (err) {
      console.error('Erro ao adicionar à lista:', err);
      // TODO: mostrar toast de erro
    } finally {
      setAddingToListId(null);
    }
  };

  return (
    <>
      <Button onClick={() => setSheetOpen(true)} variant="secondary" size="sm">
        📋 Adicionar a lista
      </Button>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Adicionar a uma lista">
        <div className="space-y-3">
          {isLoadingLists ? (
            <p className="text-text-secondary">Carregando listas...</p>
          ) : lists.length === 0 ? (
            <p className="text-text-secondary">Você ainda não tem listas.</p>
          ) : (
            lists.map((list) => {
              const isAdding = addingToListId === list.id;

              return (
                <button
                  key={list.id}
                  onClick={() => handleAddToList(list.id)}
                  disabled={isAdding}
                  className="w-full rounded-md border border-border bg-bg-subtle p-3 text-left hover:bg-bg-hover disabled:opacity-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-text-primary">{list.name}</div>
                      {list.description && (
                        <div className="mt-1 text-sm text-text-secondary">{list.description}</div>
                      )}
                      <div className="mt-1 text-xs text-text-secondary">
                        {list.placesCount ?? 0} {list.placesCount === 1 ? 'lugar' : 'lugares'}
                      </div>
                    </div>
                    <div className="text-lg">{isAdding ? '⏳' : '➕'}</div>
                  </div>
                </button>
              );
            })
          )}

          <Button onClick={() => setCreateModalOpen(true)} variant="secondary" className="w-full">
            ➕ Criar nova lista
          </Button>
        </div>
      </Sheet>

      <CreateListModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </>
  );
}
