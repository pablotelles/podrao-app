import { NextRequest, NextResponse } from 'next/server';
import { toggleFavorite } from '@/presentation/lib/container';
import { errorResponse, createRouteSupabaseClient } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ placeId: string }> },
) {
  try {
    // 1. Validar autenticação
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new UnauthorizedError();

    // 2. Chamar use case
    const { placeId } = await params;
    const result = await toggleFavorite.execute({ userId: user.id, placeId });
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
