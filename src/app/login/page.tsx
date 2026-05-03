'use client';

import { useState } from 'react';
import { Button, Input } from '@/presentation/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error: string };
        throw new Error(body.error);
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-(--spacing-page-x)">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">Entrar</h1>
        <p className="mb-8 text-sm text-text-secondary">
          Enviaremos um link mágico para o seu email.
        </p>

        {sent ? (
          <div className="rounded-lg bg-brand-subtle p-4 text-sm text-text-primary">
            Verifique seu email — o link de acesso foi enviado para <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={error ?? undefined}
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link de acesso'}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
