import { Text } from '@/presentation/components/ui/Text';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="px-(--spacing-page-x) pb-3 pt-5">
      <Text variant="heading" as="h2" className="tracking-tight">
        {title}
      </Text>
      {subtitle && (
        <Text as="p" variant="caption" textColor="secondary" className="mt-0.5">
          {subtitle}
        </Text>
      )}
    </div>
  );
}
