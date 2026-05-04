import { NextRequest, NextResponse } from 'next/server';
import { removePlaceFromList } from '@/presentation/lib/container';
import { errorResponse, createRouteSupabaseClient } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; placeId: string }> },
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
    const { id, placeId } = await params;
    await removePlaceFromList.execute({
      userId: user.id,
      listId: id,
      placeId,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
