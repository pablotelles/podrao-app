'use client';

import { useState } from 'react';
import { useZodForm } from '@/presentation/lib/forms/useZodForm';
import { loginSchema, type LoginInput } from '@/presentation/lib/forms/login/schema';
import { loginInitialValues } from '@/presentation/lib/forms/login/initialValues';
import { Button, Input } from '@/presentation/components/ui';
import { getSupabaseBrowser } from '@/presentation/lib/supabase-browser';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    const supabase = getSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    // Browser será redirecionado — não precisa setar loading de volta
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-(--spacing-page-x)">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">Entrar</h1>
        <p className="mb-8 text-sm text-text-secondary">Entre com sua conta para continuar.</p>

        {sent ? (
          <div className="rounded-lg bg-brand-subtle p-4 text-sm text-text-primary">
            Verifique seu email — o link de acesso foi enviado para{' '}
            <strong>{getValues('email')}</strong>.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
            >
              <GoogleIcon />
              {googleLoading ? 'Redirecionando...' : 'Entrar com Google'}
            </Button>

            {/* Magic link desabilitado temporariamente — mantido para rollback */}
            {/* <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-text-secondary">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="voce@email.com"
                error={errors.email?.message ?? serverError ?? undefined}
                {...register('email')}
              />
              <Button type="submit" disabled={loading || googleLoading}>
                {loading ? 'Enviando...' : 'Enviar link de acesso'}
              </Button>
            </form> */}
          </div>
        )}
      </div>
    </main>
  );
}
