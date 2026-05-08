'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (currentPage > 3) pages.push('...');

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (currentPage < totalPages - 2) pages.push('...');

  pages.push(totalPages);
  return pages;
}

export function Paginator({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginatorProps) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);
  const pages = getPageNumbers(currentPage, totalPages);

  const btnBase =
    'flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40';
  const btnGhost = `${btnBase} text-text-secondary hover:bg-brand/8 hover:text-brand`;
  const btnActive = `${btnBase} bg-brand text-text-inverse`;

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <span className="text-xs text-text-secondary">
        {from}–{to} de {totalItems}
      </span>

      <div className="flex items-center gap-1">
        <button
          className={btnGhost}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-8 w-6 items-center justify-center text-sm text-text-secondary"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              className={p === currentPage ? btnActive : btnGhost}
              onClick={() => onPageChange(p)}
              aria-label={`Página ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          className={btnGhost}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Próxima página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
