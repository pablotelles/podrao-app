import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: 'Email inválido', code: 'VALIDATION_ERROR' }, { status: 400 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      },
    );

    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback` },
    });

    if (error) return NextResponse.json({ error: error.message, code: 'AUTH_ERROR' }, { status: 400 });

    return NextResponse.json({ message: 'Email enviado' });
  } catch {
    return NextResponse.json({ error: 'Erro interno', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
