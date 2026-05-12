export const VISIT_RECENCY_VALUES = ['today', 'this_week', 'a_while_ago'] as const;
export type VisitRecency = (typeof VISIT_RECENCY_VALUES)[number];
