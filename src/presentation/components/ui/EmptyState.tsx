import type { ReactNode } from 'react';
import { Text } from './Text';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-4xl text-text-disabled">{icon}</div>}
      <Text as="p" variant="label">
        {title}
      </Text>
      {description && (
        <Text as="p" variant="body" textColor="secondary" className="mt-1">
          {description}
        </Text>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
