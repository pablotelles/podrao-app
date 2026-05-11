'use client';

import { StarRating } from '@/presentation/components/ui';
import { REVIEW_CATEGORIES, REVIEW_CATEGORY_META } from '@/domain/value-objects/ReviewCategory';
import type { ReviewScore } from '@/domain/entities/ReviewScore';

interface SubRatingListProps {
  scores: ReviewScore[];
  onChange: (scores: ReviewScore[]) => void;
}

export function SubRatingList({ scores, onChange }: SubRatingListProps) {
  const getScore = (category: (typeof REVIEW_CATEGORIES)[number]): number => {
    return scores.find((s) => s.category === category)?.score ?? 0;
  };

  const handleChange = (category: (typeof REVIEW_CATEGORIES)[number], score: number) => {
    const updated = scores.filter((s) => s.category !== category);
    if (score > 0) {
      updated.push({ category, score });
    }
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      {REVIEW_CATEGORIES.map((category) => {
        const meta = REVIEW_CATEGORY_META[category];
        const currentScore = getScore(category);
        return (
          <div key={category} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg leading-none" aria-hidden>
                {meta.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-text-primary">{meta.label}</p>
                <p className="text-[11px] text-text-secondary leading-tight">{meta.description}</p>
              </div>
            </div>
            <div className="shrink-0">
              <StarRating
                value={currentScore}
                onChange={(v) => handleChange(category, v)}
                size="sm"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
