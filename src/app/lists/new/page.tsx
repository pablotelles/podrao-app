'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLists } from '@/presentation/hooks/useLists';
import { Input } from '@/presentation/components/ui/Input';
import { Textarea } from '@/presentation/components/ui/Textarea';
import { PageHeader, PageContent } from '@/presentation/components/ui';
import { CoverSelector } from '@/presentation/components/lists/CoverSelector';
import { PrivacyToggle } from '@/presentation/components/lists/PrivacyToggle';
import { ConfigurationToggles } from '@/presentation/components/lists/ConfigurationToggles';

export default function NewListPage() {
  const router = useRouter();
  const { createList } = useLists();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [allowSave, setAllowSave] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
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
    <div className="min-h-screen bg-surface-primary">
      <PageHeader
        title="Criar lista"
        showBackButton
        sticky
        centered
        actions={[
          {
            label: 'Salvar',
            onClick: () => handleSubmit({} as React.FormEvent),
            disabled: !name.trim(),
            loading: isSubmitting,
            variant: 'primary',
          },
        ]}
      />

      <PageContent centered>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="mt-1 text-right text-xs text-text-tertiary">{name.length}/100</div>
            </div>

            <div>
              <label
                htmlFor="list-description"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Descrição <span className="text-text-tertiary">(opcional)</span>
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
              <div className="mt-1 text-right text-xs text-text-tertiary">
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

          {/* Configurações */}
          <section>
            <ConfigurationToggles
              allowSave={allowSave}
              allowComments={allowComments}
              onAllowSaveChange={setAllowSave}
              onAllowCommentsChange={setAllowComments}
            />
          </section>

          {error && (
            <div className="rounded-lg bg-error-subtle p-4 text-sm text-error">{error}</div>
          )}
        </form>
      </PageContent>
    </div>
  );
}
