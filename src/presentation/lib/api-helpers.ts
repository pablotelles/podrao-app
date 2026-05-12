import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { ValidationError } from '@/application/errors/ValidationError';
import { ConflictError } from '@/application/errors/ConflictError';
import { EditConflictError } from '@/application/errors/EditConflictError';
import { EditRateLimitError } from '@/application/errors/EditRateLimitError';
import { EditFieldNotEditableError } from '@/application/errors/EditFieldNotEditableError';
import { EditSelfVoteError } from '@/application/errors/EditSelfVoteError';
import { EditDuplicateVoteError } from '@/application/errors/EditDuplicateVoteError';
import { EditNotFoundError } from '@/application/errors/EditNotFoundError';
import { EditNotPendingError } from '@/application/errors/EditNotPendingError';
import type { User as SupabaseUser } from '@supabase/supabase-js';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function getRouteSupabaseConfig() {
  return {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    key:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  };
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ValidationError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  if (err instanceof UnauthorizedError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 401 });
  if (err instanceof ConflictError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 409 });
  if (err instanceof PlaceNotFoundError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 404 });
  if (err instanceof EditFieldNotEditableError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 422 });
  if (err instanceof EditRateLimitError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 429 });
  if (err instanceof EditSelfVoteError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 403 });
  if (err instanceof EditDuplicateVoteError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 409 });
  if (err instanceof EditConflictError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 409 });
  if (err instanceof EditNotFoundError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 404 });
  if (err instanceof EditNotPendingError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 409 });

  console.error(err);
  return NextResponse.json({ error: 'Erro interno', code: 'INTERNAL_ERROR' }, { status: 500 });
}

export async function createRouteSupabaseClient() {
  const cookieStore = await cookies();
  const { url, key } = getRouteSupabaseConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Ignorado quando chamado de Server Component (read-only)
        }
      },
    },
  });
}

/** Alias para Server Components (read-only — setAll é no-op) */
export const createServerSupabaseClient = createRouteSupabaseClient;

/** Retorna o usuário autenticado com role admin, ou lança UnauthorizedError. */
export async function requireAdmin(): Promise<SupabaseUser> {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new UnauthorizedError();

  if (user.app_metadata?.role !== 'admin') {
    throw new UnauthorizedError('Acesso restrito a administradores');
  }

  return user;
}

/** Retorna o usuário autenticado ou null. Usa getUser() (valida no servidor). */
export async function getSession(): Promise<SupabaseUser | null> {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) console.error('[getSession] getUser error:', error.message, error.status);
  if (!user) console.warn('[getSession] no user found');
  if (error || !user) return null;
  return user;
}
