import { NextRequest, NextResponse } from 'next/server';
import { getListPlaces, addPlaceToList } from '@/presentation/lib/container';
import { addPlaceToListSchema } from '@/presentation/lib/schemas/listSchema';
import { errorResponse, createRouteSupabaseClient } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const places = await getListPlaces.execute(id);
    return NextResponse.json(places);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Validar autenticação
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new UnauthorizedError();

    // 2. Validar input
    const body = await req.json();
    const parsed = addPlaceToListSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );

    // 3. Chamar use case
    const { id } = await params;
    const listPlace = await addPlaceToList.execute({
      userId: user.id,
      listId: id,
      placeId: parsed.data.placeId,
      note: parsed.data.note,
    });
    return NextResponse.json(listPlace, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
