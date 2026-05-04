import { NextRequest, NextResponse } from 'next/server';
import { getUserLists, createList } from '@/presentation/lib/container';
import { createListSchema } from '@/presentation/lib/schemas/listSchema';
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
    const lists = await getUserLists.execute({ userId: user.id });
    return NextResponse.json(lists);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
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
    const parsed = createListSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );

    // 3. Chamar use case
    const list = await createList.execute({
      userId: user.id,
      ...parsed.data,
    });
    return NextResponse.json(list, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
