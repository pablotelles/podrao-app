'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Star, LogOut, Pencil, Check, X, UserCircle } from 'lucide-react';
import { Button, Input } from '@/presentation/components/ui';
import type { User } from '@/domain/entities/User';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState({ nickname: '', name: '', headline: '' });

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: User | null) => {
        if (!data) { router.replace('/login'); return; }
        setUser(data);
        setForm({ nickname: data.nickname ?? '', name: data.name ?? '', headline: data.headline ?? '' });
      })
      .finally(() => setLoading(false));
  }, [router]);

  function startEdit() { setSaveError(null); setEditing(true); }

  function cancelEdit() {
    setEditing(false);
    setForm({ nickname: user!.nickname ?? '', name: user!.name ?? '', headline: user!.headline ?? '' });
  }

  async function saveProfile() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Erro ao salvar');
      setUser(data as User);
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() ?? '??');

  return (
    <main className="flex h-dvh flex-col bg-bg-subtle pb-16">
      {/* Header */}
      <header className="flex items-center justify-between bg-bg border-b border-border px-(--spacing-page-x) py-4">
        <h1 className="text-lg font-bold text-text-primary">Minha Conta</h1>
        {!editing && user && (
          <button onClick={startEdit} className="flex items-center gap-1.5 text-sm text-brand font-medium">
            <Pencil size={15} /> Editar
          </button>
        )}
        {editing && (
          <div className="flex gap-2">
            <button onClick={cancelEdit} className="flex items-center gap-1 text-sm text-text-secondary">
              <X size={15} /> Cancelar
            </button>
            <Button size="sm" onClick={saveProfile} disabled={saving}>
              <Check size={15} /> {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        )}
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="overflow-auto">
          <div className="flex flex-col gap-4 px-(--spacing-page-x) py-6">

            {/* Avatar + identidade */}
            <div className="flex items-center gap-4 rounded-xl bg-bg p-4 shadow-(--shadow-card) border border-border">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand text-text-inverse font-bold text-xl overflow-hidden">
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  : initials}
              </div>
              <div className="min-w-0 flex-1">
                {editing ? (
                  <Input
                    label="Nome"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <>
                    <p className="font-semibold text-text-primary truncate">{user?.name || 'Sem nome'}</p>
                    <p className="text-sm text-text-secondary">@{user?.nickname}</p>
                    <p className="text-xs text-text-disabled truncate mt-0.5">{user?.email}</p>
                  </>
                )}
              </div>
            </div>

            {/* Campos de edição */}
            {editing && (
              <div className="rounded-xl bg-bg border border-border shadow-(--shadow-card) flex flex-col gap-4 p-4">
                <Input
                  label="Nickname"
                  value={form.nickname}
                  onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value.toLowerCase() }))}
                  placeholder="seunickname"
                />
                <p className="text-xs text-text-secondary -mt-2">
                  Letras minúsculas, números e _ · 3–30 caracteres · único
                </p>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-text-primary">Headline</label>
                  <textarea
                    rows={2}
                    maxLength={160}
                    value={form.headline}
                    onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                    placeholder="Uma frase sobre você…"
                    className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                  />
                  <p className="text-xs text-text-disabled text-right">{form.headline.length}/160</p>
                </div>
                {saveError && <p className="text-xs text-error">{saveError}</p>}
              </div>
            )}

            {/* Headline exibição */}
            {!editing && user?.headline && (
              <div className="rounded-xl bg-bg border border-border shadow-(--shadow-card) px-4 py-3">
                <p className="text-sm text-text-secondary italic">"{user.headline}"</p>
              </div>
            )}

            {/* Ações */}
            {!editing && (
              <>
                <div className="rounded-xl bg-bg border border-border shadow-(--shadow-card) overflow-hidden">
                  <ActionRow icon={<MapPin size={18} className="text-brand" />} label="Meus lugares" onClick={() => {}} />
                  <div className="mx-4 h-px bg-border" />
                  <ActionRow icon={<Star size={18} className="text-brand" />} label="Minhas avaliações" onClick={() => {}} />
                  <div className="mx-4 h-px bg-border" />
                  <ActionRow icon={<UserCircle size={18} className="text-brand" />} label="Alterar foto de perfil" onClick={() => {}} />
                </div>

                <div className="rounded-xl bg-bg border border-border shadow-(--shadow-card) overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-error transition-colors hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Sair da conta</span>
                  </button>
                </div>
              </>
            )}

            <p className="text-center text-xs text-text-disabled">Onde Comer · MVP</p>
          </div>
        </div>
      )}
    </main>
  );
}

function ActionRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-bg-subtle">
      {icon}
      <span className="flex-1 text-left text-sm font-medium text-text-primary">{label}</span>
    </button>
  );
}
