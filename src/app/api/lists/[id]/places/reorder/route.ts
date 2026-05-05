import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { reorderListPlaces } from '@/presentation/lib/container';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

const schema = z.object({
  placeIds: z.array(z.string().uuid()).min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: listId } = await params;

    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new UnauthorizedError();

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );

    await reorderListPlaces.execute({
      userId: user.id,
      listId,
      orderedPlaceIds: parsed.data.placeIds,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
