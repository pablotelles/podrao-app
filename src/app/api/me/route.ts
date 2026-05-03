import { NextRequest, NextResponse } from 'next/server';
import { getSession, errorResponse } from '@/presentation/lib/api-helpers';
import { updateProfile, userRepository } from '@/presentation/lib/container';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) throw new UnauthorizedError();

    const userId = (session as { id?: string } & Record<string, unknown>).id
      ?? (session as { user: { id: string } }).user?.id;

    const user = await userRepository.findById(userId as string);
    if (!user) throw new UnauthorizedError();

    return NextResponse.json(user);
  } catch (err) {
    return errorResponse(err);
  }
}

const updateSchema = z.object({
  nickname:  z.string().regex(/^[a-z0-9_]{3,30}$/, 'Nickname inválido').optional(),
  name:      z.string().max(80).optional(),
  headline:  z.string().max(160).optional(),
  avatarUrl: z.union([z.string().url(), z.literal('')]).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new UnauthorizedError();

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const userId = (session as { id?: string } & Record<string, unknown>).id
      ?? (session as { user: { id: string } }).user?.id;

    const user = await updateProfile.execute({ userId: userId as string, ...parsed.data });
    return NextResponse.json(user);
  } catch (err) {
    return errorResponse(err);
  }
}
