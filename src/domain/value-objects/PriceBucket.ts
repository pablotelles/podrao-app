export const PRICE_BUCKETS = ['up_to_25', '25_to_45', '45_to_80', 'above_80'] as const;

export type PriceBucket = (typeof PRICE_BUCKETS)[number];

export const PRICE_BUCKET_LABELS: Record<PriceBucket, string> = {
  up_to_25: 'Até R$25',
  '25_to_45': 'R$25 – 45',
  '45_to_80': 'R$45 – 80',
  above_80: 'Acima de R$80',
};

export const PRICE_BUCKET_SYMBOL: Record<PriceBucket, string> = {
  up_to_25: '$',
  '25_to_45': '$$',
  '45_to_80': '$$$',
  above_80: '$$$$',
};
