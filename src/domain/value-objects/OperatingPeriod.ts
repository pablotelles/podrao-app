// Values match the operating_period_enum in the database (lowercase, no accents)
export const OPERATING_PERIODS = ['manha', 'tarde', 'noite', 'madrugada'] as const;

export type OperatingPeriod = (typeof OPERATING_PERIODS)[number];

export const OPERATING_PERIOD_META: Record<OperatingPeriod, { label: string; emoji: string }> = {
  manha: { label: 'Manhã', emoji: '☀️' },
  tarde: { label: 'Tarde', emoji: '🌤️' },
  noite: { label: 'Noite', emoji: '🌙' },
  madrugada: { label: 'Madrugada', emoji: '🌃' },
};
