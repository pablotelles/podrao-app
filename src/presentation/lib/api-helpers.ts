import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { ValidationError } from '@/application/errors/ValidationError';
import { ConflictError } from '@/application/errors/ConflictError';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)!;

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ValidationError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
  if (err instanceof UnauthorizedError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 401 });
  if (err instanceof ConflictError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 409 });
  if (err instanceof PlaceNotFoundError)
    return NextResponse.json({ error: err.message, code: err.code }, { status: 404 });

  console.error(err);
  return NextResponse.json({ error: 'Erro interno', code: 'INTERNAL_ERROR' }, { status: 500 });
}

export async function createRouteSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Ignorado quando chamado de Server Component (read-only)
        }
      },
    },
  });
}

/** Alias para Server Components (read-only — setAll é no-op) */
export const createServerSupabaseClient = createRouteSupabaseClient;

/** Retorna o usuário autenticado ou null. Usa getUser() (valida no servidor). */
export async function getSession(): Promise<SupabaseUser | null> {
  const supabase = await createRouteSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}
