'use client';

import { useRouter } from 'next/navigation';
import { Plus, LogOut } from 'lucide-react';
import { usePageTitle } from '@/presentation/contexts/TopBarContext';
import { useUser } from '@/presentation/contexts/UserContext';
import { useLists } from '@/presentation/hooks/useLists';
import { ListsSection } from '@/presentation/components/lists/ListsSection';
import {
  IdentitySection,
  FavoritesSection,
  RegisteredPlacesSection,
  ReviewsSection,
} from '@/presentation/components/profile';

export default function ProfilePage() {
  usePageTitle('Minha conta');
  const router = useRouter();
  const { user, loading } = useUser();
  const { lists, isLoading: listsLoading, error: listsError, refresh: listsRefresh } = useLists();

  if (!loading && !user) {
    router.replace('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <main className="pb-16 bg-bg-subtle">
      <IdentitySection />
      <FavoritesSection />
      <ListsSection
        title="Minhas Listas"
        lists={lists}
        isLoading={listsLoading}
        error={listsError}
        onRetry={listsRefresh}
        limit={5}
        footerLink={{ label: 'Ver mais', href: '/profile/listas' }}
        headerAction={
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-brand"
            onClick={() => router.push('/lists/new')}
          >
            <Plus size={14} />
            Nova lista
          </button>
        }
        emptyTitle="Nenhuma lista criada"
        emptyDescription="Crie sua primeira lista e compartilhe com amigos."
      />
      <RegisteredPlacesSection />
      <ReviewsSection />

      {/* Ações */}
      <div className="px-(--spacing-page-x) py-4 bg-bg-subtle">
        <div className="rounded-xl bg-bg border border-border shadow-(--shadow-card) overflow-hidden">
          <button
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-error transition-colors hover:bg-bg-subtle"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sair da conta</span>
          </button>
        </div>
        <p className="text-center text-xs text-text-disabled pb-2 pt-4">Onde Comer · MVP</p>
      </div>
    </main>
  );
}
