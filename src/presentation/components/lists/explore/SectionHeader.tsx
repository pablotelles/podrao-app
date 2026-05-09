interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="px-(--spacing-page-x) pb-3 pt-5">
      <h2 className="text-base font-bold tracking-tight text-text-primary">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
    </div>
  );
}
