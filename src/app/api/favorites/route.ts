import { NextRequest, NextResponse } from 'next/server';
import { getUserFavorites } from '@/presentation/lib/container';
import { errorResponse, createRouteSupabaseClient } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export async function GET(_req: NextRequest) {
  try {
    // 1. Validar autenticação
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new UnauthorizedError();

    // 2. Chamar use case
    const favorites = await getUserFavorites.execute({ userId: user.id });
    return NextResponse.json(favorites);
  } catch (err) {
    return errorResponse(err);
  }
}
