export const REVIEW_CATEGORIES = ['food', 'service', 'value'] as const;

export type ReviewCategory = (typeof REVIEW_CATEGORIES)[number];

export const REVIEW_CATEGORY_META: Record<
  ReviewCategory,
  { label: string; icon: string; description: string }
> = {
  food: {
    label: 'Comida',
    icon: '🍽️',
    description: 'Sabor, quantidade e qualidade do que veio',
  },
  service: {
    label: 'Atendimento',
    icon: '👥',
    description: 'Agilidade e simpatia de quem te atendeu',
  },
  value: {
    label: 'Custo-benefício',
    icon: '💰',
    description: 'Valeu o que você pagou?',
  },
};
