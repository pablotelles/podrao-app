import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { toggleReaction } from '@/presentation/lib/container';

const schema = z.object({
  entityType: z.enum(['review', 'place', 'list']),
  entityId: z.string().uuid(),
  type: z.enum(['useful', 'partial', 'not_useful']),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const result = await toggleReaction.execute({
      userId: user.id,
      ...parsed.data,
    });

    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
