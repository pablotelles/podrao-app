import { NextRequest, NextResponse } from 'next/server';
import { getListsContainingPlace } from '@/presentation/lib/container';
import { errorResponse, createRouteSupabaseClient } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new UnauthorizedError();

    const placeId = req.nextUrl.searchParams.get('placeId');
    if (!placeId) {
      return NextResponse.json(
        { error: 'placeId obrigatório', code: 'INVALID_INPUT' },
        { status: 400 },
      );
    }

    const listIds = await getListsContainingPlace.execute({ userId: user.id, placeId });
    return NextResponse.json({ listIds });
  } catch (err) {
    return errorResponse(err);
  }
}
