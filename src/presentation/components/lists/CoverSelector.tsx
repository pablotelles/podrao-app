'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Image as ImageIcon } from 'lucide-react';

const coverImageVariants = cva(
  'relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer hover:opacity-90',
  {
    variants: {
      selected: {
        true: 'border-brand shadow-(--shadow-card)',
        false: 'border-border hover:border-brand-subtle',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

interface CoverSelectorProps {
  value?: string;
  onChange: (url: string) => void;
}

const DEFAULT_COVERS = [
  {
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop',
    alt: 'Mesa de restaurante',
  },
  {
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop',
    alt: 'Restaurante elegante',
  },
  {
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=250&fit=crop',
    alt: 'Hambúrguer',
  },
  {
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop',
    alt: 'Comida variada',
  },
  {
    url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=250&fit=crop',
    alt: 'Pizza',
  },
];

export function CoverSelector({ value, onChange }: CoverSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text-primary">
        Capa da lista <span className="text-text-tertiary">(opcional)</span>
      </h3>
      <p className="text-sm text-text-secondary">Usar uma foto dos lugares para criar sua capa</p>
      <div className="grid grid-cols-2 gap-3">
        {DEFAULT_COVERS.map((cover) => (
          <button
            key={cover.url}
            type="button"
            onClick={() => onChange(cover.url)}
            className={coverImageVariants({ selected: value === cover.url })}
          >
            <img src={cover.url} alt={cover.alt} className="h-24 w-full object-cover" />
          </button>
        ))}
        <button
          type="button"
          className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-brand-subtle transition-colors"
        >
          <div className="flex flex-col items-center gap-1 text-text-secondary">
            <ImageIcon size={20} />
            <span className="text-xs font-medium">Alterar capa</span>
          </div>
        </button>
      </div>
    </div>
  );
}
