'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLists } from '@/presentation/hooks/useLists';
import { Button } from '@/presentation/components/ui/Button';
import { ListList } from './ListList';
import type { UserList } from '@/domain/entities/List';

export function UserListsSection() {
  const router = useRouter();
  const { lists, deleteList, isLoading } = useLists();
  const [deletingListId, setDeletingListId] = useState<string | null>(null);
  const [menuList, setMenuList] = useState<UserList | null>(null);

  const handleDelete = async (list: UserList) => {
    if (!confirm('Tem certeza que deseja deletar esta lista?')) return;

    setDeletingListId(list.id);
    try {
      await deleteList(list.id);
      setMenuList(null);
    } catch (err) {
      console.error('Erro ao deletar lista:', err);
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

      <ListList
        lists={lists}
        isLoading={isLoading}
        onMenuClick={(list) => setMenuList(list)}
        onDelete={handleDelete}
      />
    </div>
  );
}
