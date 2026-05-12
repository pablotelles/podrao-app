import { type NextRequest, NextResponse } from 'next/server';
import { listMyEdits } from '@/presentation/lib/container';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) throw new UnauthorizedError();

    const edits = await listMyEdits.execute({ userId: user.id });

    return NextResponse.json({ edits });
  } catch (err) {
    return errorResponse(err);
  }
}
