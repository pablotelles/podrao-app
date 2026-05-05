'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useSWR from 'swr';
import type { UserList } from '@/domain/entities/List';
import { useLists } from '@/presentation/hooks/useLists';
import { Input } from '@/presentation/components/ui/Input';
import { Textarea } from '@/presentation/components/ui/Textarea';
import { Button } from '@/presentation/components/ui/Button';
import { PageHeader, PageContent } from '@/presentation/components/ui';
import { CoverSelector } from '@/presentation/components/lists/CoverSelector';
import { PrivacyToggle } from '@/presentation/components/lists/PrivacyToggle';
import { ConfigurationToggles } from '@/presentation/components/lists/ConfigurationToggles';

async function fetcher(url: string): Promise<UserList> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar lista');
  return res.json() as Promise<UserList>;
}

export default function EditListPage() {
  const router = useRouter();
  const params = useParams();
  const listId = params.id as string;

  const { data: list, isLoading } = useSWR<UserList>(`/api/lists/${listId}`, fetcher);
  const { updateList, deleteList } = useLists();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [allowSave, setAllowSave] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when list loads
  useEffect(() => {
    if (list) {
      setName(list.name);
      setDescription(list.description ?? '');
      setIsPublic(list.isPublic);
      setCoverUrl(list.coverUrl);
    }
  }, [list]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nome da lista é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateList(listId, {
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
        coverUrl,
      });
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar lista');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteList(listId);
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir lista');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-primary">
        <div className="text-text-secondary">Carregando...</div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-primary">
        <div className="text-text-secondary">Lista não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <PageHeader title="Editar lista" showBackButton sticky centered />

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

          {/* Excluir lista */}
          <section className="border-t border-border pt-6">
            <Button type="button" onClick={handleDelete} variant="danger" disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir lista'}
            </Button>
          </section>
        </form>
      </PageContent>
    </div>
  );
}
