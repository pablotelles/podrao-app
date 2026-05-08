'use client';

import { useState } from 'react';
import { useFavorites } from '@/presentation/hooks/useFavorites';
import { Button } from '@/presentation/components/ui/Button';
import { useToast } from '@/presentation/hooks/useToast';

interface FavoriteButtonProps {
  placeId: string;
}

export function FavoriteButton({ placeId }: FavoriteButtonProps) {
  const { isFavorited, toggle, isLoading } = useFavorites();
  const { showToast } = useToast();
  const [isToggling, setIsToggling] = useState(false);

  const favorited = isFavorited(placeId);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggle(placeId);
      showToast({
        type: 'success',
        title: favorited ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Erro ao favoritar',
        message: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Button onClick={handleToggle} disabled={isLoading || isToggling} variant="secondary" size="sm">
      {favorited ? '❤️ Favoritado' : '🤍 Favoritar'}
    </Button>
  );
}
