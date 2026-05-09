import type { PlaceStatus } from '@/domain/entities/Place';

export const STATUS_LABELS: Record<
  PlaceStatus,
  { label: string; variant: 'success' | 'warning' | 'error' | 'default' }
> = {
  approved: { label: 'Aprovado', variant: 'success' },
  pending: { label: 'Em análise', variant: 'warning' },
  rejected: { label: 'Recusado', variant: 'error' },
};
