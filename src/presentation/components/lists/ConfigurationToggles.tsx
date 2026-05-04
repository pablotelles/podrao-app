'use client';

import { Toggle } from '@/presentation/components/ui/Toggle';

interface ConfigurationTogglesProps {
  allowSave: boolean;
  allowComments: boolean;
  onAllowSaveChange: (value: boolean) => void;
  onAllowCommentsChange: (value: boolean) => void;
}

export function ConfigurationToggles({
  allowSave,
  allowComments,
  onAllowSaveChange,
  onAllowCommentsChange,
}: ConfigurationTogglesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-text-primary">Configurações</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="allow-save" className="text-sm text-text-primary">
            Permitir que outros salvem esta lista
          </label>
          <Toggle id="allow-save" checked={allowSave} onChange={onAllowSaveChange} />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="allow-comments" className="text-sm text-text-primary">
            Permitir comentários
          </label>
          <Toggle id="allow-comments" checked={allowComments} onChange={onAllowCommentsChange} />
        </div>
      </div>
    </div>
  );
}
