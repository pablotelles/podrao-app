import { NextRequest, NextResponse } from 'next/server';
import { getListById, deleteList, updateList } from '@/presentation/lib/container';
import { updateListSchema } from '@/presentation/lib/schemas/listSchema';
import { errorResponse, createRouteSupabaseClient } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const list = await getListById.execute({ listId: id });

    if (!list) {
      return NextResponse.json(
        { error: 'Lista não encontrada', code: 'LIST_NOT_FOUND' },
        { status: 404 },
      );
    }

    return NextResponse.json(list);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const parsed = updateListSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );

    // 3. Chamar use case
    const { id } = await params;
    const list = await updateList.execute({
      userId: user.id,
      listId: id,
      ...parsed.data,
    });
    return NextResponse.json(list);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Validar autenticação
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new UnauthorizedError();

    // 2. Chamar use case
    const { id } = await params;
    await deleteList.execute({ userId: user.id, listId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
