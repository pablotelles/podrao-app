'use client';

import { useState } from 'react';
import { useZodForm } from '@/presentation/lib/forms/useZodForm';
import { loginSchema, type LoginInput } from '@/presentation/lib/forms/login/schema';
import { loginInitialValues } from '@/presentation/lib/forms/login/initialValues';
import { Button, Input } from '@/presentation/components/ui';

export default function LoginPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useZodForm<LoginInput>({
    schema: loginSchema,
    defaultValues: loginInitialValues,
  });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    setServerError(null);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error: string };
        throw new Error(body.error);
      }
      setSent(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro ao enviar email');
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
            Verifique seu email — o link de acesso foi enviado para{' '}
            <strong>{getValues('email')}</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="voce@email.com"
              error={errors.email?.message ?? serverError ?? undefined}
              {...register('email')}
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
