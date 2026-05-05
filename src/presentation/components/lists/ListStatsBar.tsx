'use client';

import { MapPin, Bookmark, Eye, ThumbsUp, DollarSign } from 'lucide-react';

interface ListStatsBarProps {
  placesCount: number;
  savesCount: number;
  viewCount: number;
  recommendPercent?: number;
  priceBucket?: string;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 py-3">
      {icon}
      <span className="text-lg font-bold text-text-primary leading-none">{value}</span>
      <span className="text-[10px] text-text-secondary">{label}</span>
    </div>
  );
}

export function ListStatsBar({
  placesCount,
  savesCount,
  viewCount,
  recommendPercent,
  priceBucket,
}: ListStatsBarProps) {
  return (
    <div className="flex items-stretch border-b border-border bg-bg-card rounded-t-md overflow-hidden">
      <StatItem
        icon={<MapPin className="h-6 w-6 text-brand" />}
        value={formatCount(placesCount)}
        label="lugares"
      />
      <StatItem
        icon={<Bookmark className="h-6 w-6 text-brand" />}
        value={formatCount(savesCount)}
        label="salvos"
      />
      <StatItem
        icon={<Eye className="h-6 w-6 text-brand" />}
        value={formatCount(viewCount)}
        label="visualizações"
      />
      {recommendPercent !== undefined && (
        <StatItem
          icon={<ThumbsUp className="h-6 w-6 text-brand" />}
          value={`${recommendPercent}%`}
          label="recomendam"
        />
      )}
      {priceBucket && (
        <StatItem
          icon={<DollarSign className="h-6 w-6 text-brand" />}
          value={priceBucket}
          label="faixa de preço"
        />
      )}
    </div>
  );
}
