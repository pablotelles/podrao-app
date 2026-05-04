'use client';

import { Check } from 'lucide-react';

interface MealTypeCardProps {
  emoji: string;
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function MealTypeCard({ emoji, label, selected, onToggle }: MealTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        'relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 transition-all',
        selected
          ? 'border-brand bg-brand-subtle text-brand'
          : 'border-border bg-surface text-text-primary',
      ].join(' ')}
    >
      {selected && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand">
          <Check size={11} strokeWidth={3} className="text-white" />
        </span>
      )}
      <span className="text-2xl leading-none">{emoji}</span>
      <span className="text-center text-xs font-medium leading-tight">{label}</span>
    </button>
  );
}
