import { type NextRequest, NextResponse } from 'next/server';
import { getEditWithVotes } from '@/presentation/lib/container';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const edit = await getEditWithVotes.execute({ editId: id, viewerUserId: user?.id });

    if (!edit) {
      return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ edit });
  } catch (err) {
    return errorResponse(err);
  }
}
