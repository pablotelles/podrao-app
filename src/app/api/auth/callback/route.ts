import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code      = searchParams.get('code');       // PKCE flow (novo padrão)
  const tokenHash = searchParams.get('token_hash'); // OTP flow (legado)
  const type      = searchParams.get('type');       // signup | magiclink | email

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

  // Fluxo 1: PKCE — Supabase verifica o token internamente e manda um `code`
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL('/login?error=expired_link', req.url));
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Fluxo 2: OTP direto via token_hash (signup, magiclink ou email são todos válidos)
  if (tokenHash && type) {
    const otpType = type === 'signup' || type === 'magiclink' ? 'email' : (type as 'email');
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType });
    if (error) return NextResponse.redirect(new URL('/login?error=expired_link', req.url));
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.redirect(new URL('/login?error=invalid_link', req.url));
}
