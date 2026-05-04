'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLists } from '@/presentation/hooks/useLists';
import { Button } from '@/presentation/components/ui/Button';
import { ListCard } from './ListCard';

export function UserListsSection() {
  const router = useRouter();
  const { lists, deleteList, isLoading } = useLists();
  const [deletingListId, setDeletingListId] = useState<string | null>(null);

  const handleDelete = async (listId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta lista?')) return;

    setDeletingListId(listId);
    try {
      await deleteList(listId);
      // TODO: mostrar toast de sucesso
    } catch (err) {
      console.error('Erro ao deletar lista:', err);
      // TODO: mostrar toast de erro
    } finally {
      setDeletingListId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Minhas Listas</h2>
        <Button onClick={() => router.push('/lists/new')} size="sm">
          ➕ Nova Lista
        </Button>
      </div>

      {isLoading ? (
        <p className="text-text-secondary">Carregando listas...</p>
      ) : lists.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-subtle p-8 text-center">
          <p className="mb-4 text-text-secondary">Você ainda não criou nenhuma lista.</p>
          <Button onClick={() => router.push('/lists/new')}>Criar minha primeira lista</Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onClick={() => {
                // TODO: navegar para página de detalhe da lista
                console.log('Ver lista:', list.id);
              }}
              onDelete={deletingListId === list.id ? undefined : () => handleDelete(list.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
