'use client';

import { MapPin, Bookmark, Eye, ThumbsUp, DollarSign } from 'lucide-react';
import { Text } from '@/presentation/components/ui/Text';

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
      <Text as="span" variant="heading" className="leading-none">
        {value}
      </Text>
      <Text as="span" variant="caption" textColor="secondary">
        {label}
      </Text>
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
    <div className="flex items-stretch rounded-t-sm overflow-hidden">
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
