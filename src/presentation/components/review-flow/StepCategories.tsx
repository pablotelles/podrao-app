'use client';

import { StarRating } from '@/presentation/components/ui';
import { REVIEW_CATEGORY_META, type ReviewCategory } from '@/domain/value-objects/ReviewCategory';
import type { ReviewScore } from '@/domain/entities/ReviewScore';

interface StepCategoriesProps {
  scores: ReviewScore[];
  onChange: (scores: ReviewScore[]) => void;
}

const CATEGORIES: ReviewCategory[] = ['food', 'service', 'ambience', 'value', 'cleanliness'];

export function StepCategories({ scores, onChange }: StepCategoriesProps) {
  const handleScoreChange = (category: ReviewCategory, score: number) => {
    const updated = scores.filter((s) => s.category !== category);
    updated.push({ category, score });
    onChange(updated);
  };

  const getScore = (category: ReviewCategory): number => {
    return scores.find((s) => s.category === category)?.score ?? 0;
  };

  return (
    <div className="py-4">
      <h2 className="mb-2 text-xl font-bold text-text-primary">Como você avalia estes aspectos?</h2>
      <p className="mb-6 text-sm text-text-secondary">
        Sua opinião em cada detalhe faz a diferença
      </p>

      <div className="flex flex-col gap-4">
        {CATEGORIES.map((category) => {
          const meta = REVIEW_CATEGORY_META[category];
          return (
            <div key={category} className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">{meta.icon}</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-text-primary">{meta.label}</h3>
                  <p className="text-xs text-text-secondary">{meta.description}</p>
                </div>
              </div>
              <StarRating
                value={getScore(category)}
                onChange={(score) => handleScoreChange(category, score)}
                size="sm"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
