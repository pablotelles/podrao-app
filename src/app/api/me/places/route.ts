import { NextRequest, NextResponse } from 'next/server';
import { getMyPlaces } from '@/presentation/lib/container';
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

    const places = await getMyPlaces.execute({ userId: user.id });
    return NextResponse.json(places);
  } catch (err) {
    return errorResponse(err);
  }
}
