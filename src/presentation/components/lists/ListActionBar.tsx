'use client';

import { MapPin, Bookmark, Eye, Share2 } from 'lucide-react';

interface ListActionBarProps {
  placesCount: number;
  savesCount: number;
  viewCount: number;
  isSaved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  isLoggedIn: boolean;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const itemBase =
  'flex flex-1 flex-col items-center justify-between rounded-xl py-3 transition-colors';

function CountLabel({ count, label }: { count: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-base font-semibold text-text-primary leading-none">
        {formatCount(count)}
      </span>
      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  );
}

export function ListActionBar({
  placesCount,
  savesCount,
  viewCount,
  isSaved,
  onToggleSave,
  onShare,
  isLoggedIn,
}: ListActionBarProps) {
  return (
    <div className="mt-4 flex gap-2 rounded-sm border border-border p-1">
      {/* Lugares */}
      <div className={itemBase}>
        <MapPin className="h-5 w-5 text-purple-500" />
        <CountLabel count={placesCount} label="lugares" />
      </div>

      {/* Salvos */}
      <button
        onClick={isLoggedIn ? onToggleSave : undefined}
        className={itemBase}
        disabled={!isLoggedIn}
        aria-label="Salvar lista"
      >
        <Bookmark className={`h-5 w-5 text-brand ${isSaved ? 'fill-brand' : ''}`} />
        <CountLabel count={savesCount} label="salvos" />
      </button>

      {/* Visualizações */}
      <div className={itemBase}>
        <Eye className="h-5 w-5 text-orange-500" />
        <CountLabel count={viewCount} label="visualizações" />
      </div>

      {/* Compartilhar */}
      <button onClick={onShare} className={itemBase} aria-label="Compartilhar lista">
        <Share2 className="h-5 w-5 text-indigo-500" />
        <span className="text-xs text-text-secondary">Compartilhar</span>
      </button>
    </div>
  );
}
