import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code      = searchParams.get('code');       // PKCE flow
  const tokenHash = searchParams.get('token_hash'); // OTP flow
  const type      = searchParams.get('type');

  const successUrl = new URL('/', req.url);
  const errorUrl   = new URL('/login?error=expired_link', req.url);

  // A response é criada antes — cookies serão setadas NELA, não em cookieStore
  const response = NextResponse.redirect(successUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) =>
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          ),
      },
    },
  );

  // Fluxo PKCE (padrão mais recente do Supabase)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(errorUrl);
    return response;
  }

  // Fluxo OTP / magic link
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'email',
    });
    if (error) return NextResponse.redirect(errorUrl);
    return response;
  }

  return NextResponse.redirect(new URL('/login?error=invalid_link', req.url));
}
