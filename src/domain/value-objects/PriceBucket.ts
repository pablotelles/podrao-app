export const PRICE_BUCKETS = ['up_to_15', '15_25', '25_40', '40_70', '70_plus'] as const;

export type PriceBucket = (typeof PRICE_BUCKETS)[number];

export const PRICE_BUCKET_LABELS: Record<PriceBucket, string> = {
  up_to_15: 'Até R$15',
  '15_25': 'R$15–25',
  '25_40': 'R$25–40',
  '40_70': 'R$40–70',
  '70_plus': 'Acima de R$70',
};
