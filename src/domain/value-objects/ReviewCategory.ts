export const REVIEW_CATEGORIES = ['food', 'service', 'ambience', 'value', 'cleanliness'] as const;

export type ReviewCategory = (typeof REVIEW_CATEGORIES)[number];

export const REVIEW_CATEGORY_META: Record<
  ReviewCategory,
  { label: string; icon: string; description: string }
> = {
  food: {
    label: 'Comida',
    icon: '🍽️',
    description: 'Sabor, apresentação e qualidade dos pratos',
  },
  service: {
    label: 'Atendimento',
    icon: '👥',
    description: 'Cortesia, agilidade e atenção da equipe',
  },
  ambience: {
    label: 'Ambiente',
    icon: '🏠',
    description: 'Decoração, conforto e atmosfera do lugar',
  },
  value: {
    label: 'Custo-benefício',
    icon: '💰',
    description: 'Relação entre qualidade e preço cobrado',
  },
  cleanliness: {
    label: 'Limpeza',
    icon: '✨',
    description: 'Higiene e organização do ambiente',
  },
};
