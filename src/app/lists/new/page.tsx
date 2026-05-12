'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLists } from '@/presentation/hooks/useLists';
import { Input } from '@/presentation/components/ui/Input';
import { Textarea } from '@/presentation/components/ui/Textarea';
import { PageContent, Button } from '@/presentation/components/ui';
import { usePageTitle } from '@/presentation/contexts/TopBarContext';
import { CoverSelector } from '@/presentation/components/lists/CoverSelector';
import { PrivacyToggle } from '@/presentation/components/lists/PrivacyToggle';

export default function NewListPage() {
  usePageTitle('Nova lista');
  const router = useRouter();
  const { createList } = useLists();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nome da lista é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      await createList(name.trim(), description.trim() || undefined, isPublic, coverUrl);
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar lista');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg pb-24">
      <PageContent centered>
        <form id="create-list-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Informações da lista */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-text-primary">Informações da lista</h2>

            <div>
              <label
                htmlFor="list-name"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Nome da lista <span className="text-error">*</span>
              </label>
              <Input
                id="list-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Almoço barato"
                maxLength={100}
                disabled={isSubmitting}
              />
              <div className="mt-1 text-right text-xs text-text-secondary">{name.length}/100</div>
            </div>

            <div>
              <label
                htmlFor="list-description"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Descrição <span className="text-text-secondary">(opcional)</span>
              </label>
              <Textarea
                id="list-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Lugares com preço justo e comida boa para almoço durante a semana."
                maxLength={500}
                disabled={isSubmitting}
                rows={3}
              />
              <div className="mt-1 text-right text-xs text-text-secondary">
                {description.length}/500
              </div>
            </div>
          </section>

          {/* Privacidade */}
          <section>
            <PrivacyToggle value={isPublic} onChange={setIsPublic} />
          </section>

          {/* Capa da lista */}
          <section>
            <CoverSelector value={coverUrl} onChange={setCoverUrl} />
          </section>

          {error && (
            <div className="rounded-lg border border-error bg-bg-subtle p-4 text-sm text-error">
              {error}
            </div>
          )}
        </form>
      </PageContent>

      {/* Botão fixo no bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t border-border bg-bg px-(--spacing-page-x) py-4"
        style={{ zIndex: 'var(--z-sticky)' }}
      >
        <div className="mx-auto max-w-lg">
          <Button
            type="submit"
            form="create-list-form"
            disabled={!name.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
