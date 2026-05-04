'use client';

import type { ReactNode } from 'react';

interface PageContentProps {
  children: ReactNode;
  /** Aplicar max-width e centralizar (padrão: false) */
  centered?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Container padrão para conteúdo de páginas.
 * Adiciona padding-bottom automático para compensar o menu de navegação inferior fixo.
 * Use `centered` para aplicar max-width e centralização.
 */
export function PageContent({ children, centered = false, className = '' }: PageContentProps) {
  const contentClasses = [
    'px-(--spacing-page-x) py-6 pb-24', // pb-24 = 96px (menu de 64px + espaço extra)
    centered && 'mx-auto max-w-2xl',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <main className={contentClasses}>{children}</main>;
}
