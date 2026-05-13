import { NextResponse } from 'next/server';
import { ONBOARDING_COOKIE } from '@/presentation/lib/server/onboarding-cookie';

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(ONBOARDING_COOKIE, 'true', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
