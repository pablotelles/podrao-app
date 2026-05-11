import { SlidersHorizontal } from 'lucide-react';
import { Text } from '@/presentation/components/ui/Text';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Badge text shown next to the title (e.g. radius "500m") */
  badge?: string;
  /** Right-side CTA link/button */
  cta?: { label: string; href?: string; onClick?: () => void };
  /** Shows a filter icon button on the right side of the title row */
  onFilterClick?: () => void;
}

export function SectionHeader({ title, subtitle, badge, cta, onFilterClick }: SectionHeaderProps) {
  const hasRightAction = cta !== undefined || onFilterClick !== undefined;

  return (
    <div className="px-(--spacing-page-x) pb-3 pt-5">
      <div className={hasRightAction ? 'flex items-center justify-between' : undefined}>
        <div className="flex items-center gap-2">
          <Text variant="heading" as="h2" className="tracking-tight">
            {title}
          </Text>
          {badge && (
            <span
              className="rounded-full bg-bg-subtle px-2 py-0.5 font-medium text-text-secondary"
              style={{ fontSize: 'var(--font-size-caption)' }}
            >
              {badge}
            </span>
          )}
        </div>

        {onFilterClick && (
          <button
            onClick={onFilterClick}
            aria-label="Filtrar"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-bg text-text-secondary"
          >
            <SlidersHorizontal size={13} />
          </button>
        )}

        {cta &&
          !onFilterClick &&
          (cta.href ? (
            <a
              href={cta.href}
              className="font-medium text-brand"
              style={{ fontSize: 'var(--font-size-label)' }}
            >
              {cta.label}
            </a>
          ) : (
            <button
              onClick={cta.onClick}
              className="font-medium text-brand"
              style={{ fontSize: 'var(--font-size-label)' }}
            >
              {cta.label}
            </button>
          ))}
      </div>

      {subtitle && (
        <Text as="p" variant="caption" textColor="secondary" className="mt-0.5">
          {subtitle}
        </Text>
      )}
    </div>
  );
}
