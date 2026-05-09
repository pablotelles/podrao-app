import type { ReactNode } from 'react';
import Link from 'next/link';

interface SectionShellProps {
  title: string;
  headerAction?: ReactNode;
  footerLink?: { label: string; href: string };
  children: ReactNode;
}

export function SectionShell({ title, headerAction, footerLink, children }: SectionShellProps) {
  return (
    <section className="bg-bg mb-2">
      <div className="px-(--spacing-page-x) py-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {headerAction}
      </div>
      <div className="px-(--spacing-page-x)">{children}</div>
      {footerLink && (
        <div className="border-t border-bg-subtle py-3 text-center">
          <Link href={footerLink.href} className="text-sm font-medium text-brand">
            {footerLink.label}
          </Link>
        </div>
      )}
    </section>
  );
}
