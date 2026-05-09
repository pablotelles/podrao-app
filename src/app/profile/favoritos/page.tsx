'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/presentation/contexts/UserContext';
import { useFavoritePlaces } from '@/presentation/hooks/useFavoritePlaces';
import { PlaceList } from '@/presentation/components/places/PlaceList';
import { PageHeader } from '@/presentation/components/ui/PageHeader';

export default function FavoritosPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { places, isLoading, error } = useFavoritePlaces();

  if (!loading && !user) {
    router.replace('/login');
    return null;
  }

  return (
    <main className="pb-16">
      <PageHeader title="Favoritos" showBackButton onBack={() => router.back()} />
      <div className="px-(--spacing-page-x) py-4">
        <PlaceList places={places} isLoading={isLoading} error={error} />
      </div>
    </main>
  );
}
