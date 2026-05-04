'use client';

import { MapPin, Heart, Eye, Bookmark } from 'lucide-react';
import { cva } from 'class-variance-authority';

interface ListActionBarProps {
  placesCount: number;
  favoritesCount: number;
  viewCount: number;
  savesCount: number;
  isFavorited: boolean;
  isSaved: boolean;
  onToggleFavorite: () => void;
  onToggleSave: () => void;
  isLoggedIn: boolean;
}

const actionBtn = cva('flex flex-1 flex-col items-center gap-1 rounded-xl py-3 transition-colors', {
  variants: {
    active: {
      true: 'text-brand',
      false: 'text-text-secondary',
    },
  },
  defaultVariants: { active: false },
});

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function ListActionBar({
  placesCount,
  favoritesCount,
  viewCount,
  savesCount,
  isFavorited,
  isSaved,
  onToggleFavorite,
  onToggleSave,
  isLoggedIn,
}: ListActionBarProps) {
  return (
    <div className="mt-4 flex gap-2 rounded-2xl border border-border bg-bg-subtle p-1">
      {/* Lugares — apenas exibição */}
      <div className={actionBtn({ active: false })}>
        <MapPin className="h-5 w-5" />
        <span className="text-base font-semibold text-text-primary leading-none">
          {formatCount(placesCount)}
        </span>
        <span className="text-xs text-text-secondary">lugares</span>
      </div>

      {/* Favoritos */}
      <button
        onClick={isLoggedIn ? onToggleFavorite : undefined}
        className={actionBtn({ active: isFavorited })}
        disabled={!isLoggedIn}
        aria-label="Favoritar lista"
      >
        <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
        <span className="text-base font-semibold text-text-primary leading-none">
          {formatCount(favoritesCount)}
        </span>
        <span className="text-xs text-text-secondary">favoritos</span>
      </button>

      {/* Visualizações — apenas exibição */}
      <div className={actionBtn({ active: false })}>
        <Eye className="h-5 w-5" />
        <span className="text-base font-semibold text-text-primary leading-none">
          {formatCount(viewCount)}
        </span>
        <span className="text-xs text-text-secondary">visualizações</span>
      </div>

      {/* Salvos */}
      <button
        onClick={isLoggedIn ? onToggleSave : undefined}
        className={actionBtn({ active: isSaved })}
        disabled={!isLoggedIn}
        aria-label="Salvar lista"
      >
        <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
        <span className="text-base font-semibold text-text-primary leading-none">
          {formatCount(savesCount)}
        </span>
        <span className="text-xs text-text-secondary">salvos</span>
      </button>
    </div>
  );
}
