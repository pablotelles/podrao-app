'use client';

import React from 'react';
import type { ReactNode } from 'react';
import { Paginator } from './Paginator';
import type { PaginatorProps } from './Paginator';

export interface DataTableColumn<T extends object> {
  label: string;
  key: keyof T | string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T extends object> {
  columns: DataTableColumn<T>[];
  data: T[];
  renderCell?: (columnKey: string, value: unknown, row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  pagination?: PaginatorProps;
  className?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  renderCell,
  onRowClick,
  pagination,
  className = '',
}: DataTableProps<T>) {
  const getAlignClass = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div>
      <table
        className={`w-full border-collapse border border-border bg-bg shadow-(--shadow-card) ${className}`}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                style={{
                  width: column.width,
                  position: 'sticky',
                  top: 'var(--topbar-height)',
                  zIndex: 'var(--z-sticky)',
                }}
                className={`border-b border-border bg-bg-subtle px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap ${getAlignClass(column.align)}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-border transition-colors last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-brand/5' : ''} ${rowIdx % 2 === 0 ? 'bg-bg' : 'bg-bg-subtle/40'}`}
            >
              {columns.map((column) => {
                const value = (row as Record<string, unknown>)[String(column.key)];
                const rendered = renderCell
                  ? renderCell(String(column.key), value, row)
                  : (value as React.ReactNode);

                return (
                  <td
                    key={String(column.key)}
                    style={{ width: column.width }}
                    className={`px-3 py-2 text-sm text-text-primary ${getAlignClass(column.align)}`}
                  >
                    {rendered}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && <Paginator {...pagination} />}
    </div>
  );
}
