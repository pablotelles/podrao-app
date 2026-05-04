import { NextRequest, NextResponse } from 'next/server';
import { toggleListFavorite } from '@/presentation/lib/container';
import { errorResponse, createRouteSupabaseClient } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new UnauthorizedError();

    const { id } = await params;
    const result = await toggleListFavorite.execute({ userId: user.id, listId: id });
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
