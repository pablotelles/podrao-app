'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';
import { Text } from './Text';

export interface PageHeaderAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Array de ações que serão renderizadas como botões */
  actions?: PageHeaderAction[];
  /** Mostrar botão de voltar (padrão: false) */
  showBackButton?: boolean;
  /** Callback para voltar (padrão: router.back()) */
  onBack?: () => void;
  /** Header fixo no topo (padrão: false) */
  sticky?: boolean;
  /** Centralizar conteúdo com max-width (padrão: false) */
  centered?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  showBackButton = false,
  onBack,
  sticky = false,
  centered = false,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const headerClasses = [
    'shrink-0 flex border-b border-border bg-bg px-(--spacing-page-x) py-4',
    sticky && 'sticky top-0 z-10',
  ]
    .filter(Boolean)
    .join(' ');

  const contentClasses = [
    'flex items-center justify-between gap-4 w-full',
    centered && 'mx-auto max-w-2xl',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClasses}>
      <div className={contentClasses}>
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center justify-center hover:opacity-70 transition-opacity"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} className="text-text-primary" />
            </button>
          )}
          <Text variant="heading" as="h1">
            {title}
          </Text>
        </div>
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                variant={action.variant || 'primary'}
                size="xs"
              >
                {action.loading ? 'Carregando...' : action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
