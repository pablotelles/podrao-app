'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button, Input } from '@/presentation/components/ui';
import type { User } from '@/domain/entities/User';

interface EditProfileFormProps {
  user: User;
  onSaved: (updated: User) => void;
  onCancel: () => void;
}

export function EditProfileForm({ user, onSaved, onCancel }: EditProfileFormProps) {
  const [form, setForm] = useState({
    name:     user.name     ?? '',
    nickname: user.nickname ?? '',
    headline: user.headline ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     form.name.trim()     || undefined,
          nickname: form.nickname.trim() || undefined,
          headline: form.headline.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Erro ao salvar');
      onSaved(data as User);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-(--spacing-page-x) py-6">
      {/* Avatar placeholder */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-text-inverse text-2xl font-bold">
          {form.name
            ? form.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
            : form.nickname.slice(0, 2).toUpperCase()}
        </div>
        <button className="text-sm text-brand font-medium">Alterar foto</button>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Nome"
          value={form.name}
          onChange={set('name')}
          placeholder="Seu nome completo"
          maxLength={80}
        />

        <div className="flex flex-col gap-1">
          <Input
            label="Nickname"
            value={form.nickname}
            onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
            placeholder="seunickname"
            maxLength={30}
          />
          <p className="text-xs text-text-secondary px-1">
            Letras minúsculas, números e _ · mínimo 3 caracteres · único
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-primary">Headline</label>
          <textarea
            rows={3}
            maxLength={160}
            value={form.headline}
            onChange={set('headline')}
            placeholder="Uma frase sobre você, o que você curte comer…"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          />
          <p className="text-xs text-text-disabled text-right">{form.headline.length}/160</p>
        </div>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button className="flex-1" onClick={save} disabled={saving}>
          <Check size={16} />
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}
