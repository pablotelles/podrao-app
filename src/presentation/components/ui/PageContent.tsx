'use client';

import type { ReactNode } from 'react';

interface PageContentProps {
  children: ReactNode;
  /** Aplicar max-width e centralizar (padrão: false) */
  centered?: boolean;
  /** Classe CSS adicional */
  className?: string;
  /**
   * Override do padding inferior. Use quando há um sticky CTA acima do BottomNav.
   * Padrão: 'pb-24' (96px = BottomNav 64px + buffer)
   * Com sticky CTA de dois botões: 'pb-48' (192px = CTA ~128px + BottomNav 64px)
   */
  bottomPad?: string;
}

/**
 * Container padrão para conteúdo de páginas.
 * Adiciona padding-bottom automático para compensar o menu de navegação inferior fixo.
 * Use `centered` para aplicar max-width e centralização.
 * Use `bottomPad` quando há um sticky CTA acima do BottomNav.
 */
export function PageContent({
  children,
  centered = false,
  className = '',
  bottomPad = 'pb-24',
}: PageContentProps) {
  const contentClasses = [
    `px-(--spacing-page-x) py-6 ${bottomPad}`,
    centered && 'mx-auto max-w-2xl',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <main className={contentClasses}>{children}</main>;
}
