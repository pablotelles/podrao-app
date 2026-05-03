import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { ValidationError } from '@/application/errors/ValidationError';
import { ConflictError } from '@/application/errors/ConflictError';

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

export async function getSession() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) =>
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  );
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
