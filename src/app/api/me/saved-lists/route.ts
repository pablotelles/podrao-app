import { NextRequest, NextResponse } from 'next/server';
import { getSavedLists } from '@/presentation/lib/container';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new UnauthorizedError();

    const lists = await getSavedLists.execute({ userId: user.id });
    return NextResponse.json(lists);
  } catch (err) {
    return errorResponse(err);
  }
}
