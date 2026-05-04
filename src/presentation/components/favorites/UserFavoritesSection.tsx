'use client';

import { useFavorites } from '@/presentation/hooks/useFavorites';
import { Card } from '@/presentation/components/ui/Card';

export function UserFavoritesSection() {
  const { favorites, isLoading } = useFavorites();

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-text-primary">Lugares Favoritos</h2>

      {isLoading ? (
        <p className="text-text-secondary">Carregando favoritos...</p>
      ) : favorites.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-subtle p-8 text-center">
          <p className="text-text-secondary">Você ainda não favoritou nenhum lugar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((favorite) => (
            <Card key={favorite.placeId} className="p-3">
              <p className="text-sm text-text-secondary">
                Favoritado em {new Date(favorite.createdAt).toLocaleDateString('pt-BR')}
              </p>
              {/* TODO: Buscar dados completos do lugar e exibir */}
              <p className="text-xs text-text-disabled mt-1">ID: {favorite.placeId}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
