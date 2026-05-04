'use client';

import { Globe, Lock } from 'lucide-react';
import { cva } from 'class-variance-authority';

const privacyOptionVariants = cva(
  'flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all',
  {
    variants: {
      selected: {
        true: 'border-brand bg-brand-subtle',
        false: 'border-border hover:border-brand-subtle',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

interface PrivacyToggleProps {
  value: boolean;
  onChange: (isPublic: boolean) => void;
}

export function PrivacyToggle({ value, onChange }: PrivacyToggleProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text-primary">Privacidade</h3>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={privacyOptionVariants({ selected: value })}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
            <Globe size={20} />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-text-primary">Pública</div>
            <div className="text-xs text-text-secondary">Qualquer pessoa pode ver esta lista</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={privacyOptionVariants({ selected: !value })}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-tertiary text-text-secondary">
            <Lock size={20} />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-text-primary">Privada</div>
            <div className="text-xs text-text-secondary">Apenas você pode ver esta lista</div>
          </div>
        </button>
      </div>
    </div>
  );
}
