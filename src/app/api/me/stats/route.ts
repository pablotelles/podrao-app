import { NextResponse } from 'next/server';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { getUserStats } from '@/presentation/lib/container';

export async function GET() {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) throw new UnauthorizedError();

    const stats = await getUserStats.execute({ userId: user.id });

    return NextResponse.json(stats);
  } catch (err) {
    return errorResponse(err);
  }
}
