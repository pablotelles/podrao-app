'use client';

import { useState } from 'react';
import { useFavorites } from '@/presentation/hooks/useFavorites';
import { Button } from '@/presentation/components/ui/Button';

interface FavoriteButtonProps {
  placeId: string;
}

export function FavoriteButton({ placeId }: FavoriteButtonProps) {
  const { isFavorited, toggle, isLoading } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);

  const favorited = isFavorited(placeId);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggle(placeId);
    } catch (err) {
      console.error('Erro ao favoritar:', err);
      // TODO: mostrar toast de erro
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
