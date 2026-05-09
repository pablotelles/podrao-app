'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/presentation/contexts/UserContext';
import { useLists } from '@/presentation/hooks/useLists';
import { ListsSection } from '@/presentation/components/lists/ListsSection';
import { PageHeader } from '@/presentation/components/ui/PageHeader';

export default function ListasPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { lists, isLoading, error, refresh } = useLists();

  if (!loading && !user) {
    router.replace('/login');
    return null;
  }

  return (
    <main className="pb-16">
      <PageHeader
        title="Minhas listas"
        showBackButton
        onBack={() => router.back()}
        actions={[{ label: 'Nova lista', onClick: () => router.push('/lists/new') }]}
      />
      <div className="py-4">
        <ListsSection
          lists={lists}
          isLoading={isLoading}
          error={error}
          onRetry={refresh}
          emptyTitle="Nenhuma lista criada"
          emptyDescription="Crie sua primeira lista e compartilhe com amigos."
        />
      </div>
    </main>
  );
}
