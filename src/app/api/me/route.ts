import { NextResponse } from 'next/server';
import { getSession } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { errorResponse } from '@/presentation/lib/api-helpers';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) throw new UnauthorizedError();
    return NextResponse.json({ id: session.user.id, email: session.user.email });
  } catch (err) {
    return errorResponse(err);
  }
}
