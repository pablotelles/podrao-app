'use client';

import { useState } from 'react';
import { useLists } from '@/presentation/hooks/useLists';
import { Sheet } from '@/presentation/components/ui/Sheet';
import { Input } from '@/presentation/components/ui/Input';
import { Textarea } from '@/presentation/components/ui/Textarea';
import { Button } from '@/presentation/components/ui/Button';

interface CreateListModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateListModal({ open, onClose }: CreateListModalProps) {
  const { createList } = useLists();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nome da lista é obrigatório');
      return;
    }

    setIsCreating(true);
    try {
      await createList(name.trim(), description.trim() || undefined, isPublic);
      setName('');
      setDescription('');
      setIsPublic(true);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar lista');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Nova Lista">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="list-name" className="mb-2 block text-sm font-medium text-text-primary">
            Nome da lista *
          </label>
          <Input
            id="list-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Meus favoritos"
            maxLength={100}
            disabled={isCreating}
          />
        </div>

        <div>
          <label
            htmlFor="list-description"
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            Descrição (opcional)
          </label>
          <Textarea
            id="list-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva sua lista..."
            maxLength={500}
            disabled={isCreating}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="list-public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            disabled={isCreating}
            className="h-4 w-4 rounded border-border"
          />
          <label htmlFor="list-public" className="text-sm text-text-secondary">
            Lista pública (outros usuários podem ver)
          </label>
        </div>

        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="flex gap-3">
          <Button type="button" onClick={onClose} variant="secondary" disabled={isCreating}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Criando...' : 'Criar Lista'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
