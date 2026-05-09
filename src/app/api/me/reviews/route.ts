import { NextResponse } from 'next/server';
import { getMyReviews } from '@/presentation/lib/container';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export async function GET() {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new UnauthorizedError();

    const reviews = await getMyReviews.execute({ userId: user.id });
    return NextResponse.json(reviews);
  } catch (err) {
    return errorResponse(err);
  }
}
