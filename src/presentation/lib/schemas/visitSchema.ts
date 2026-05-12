import { z } from 'zod';
import { VISIT_RECENCY_VALUES } from '@/domain/value-objects/VisitRecency';

export const registerVisitSchema = z.object({
  recency: z.enum(VISIT_RECENCY_VALUES),
});
