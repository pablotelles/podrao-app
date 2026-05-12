import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { voteOnEdit } from '@/presentation/lib/container';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

const voteSchema = z.object({
  voteType: z.enum(['confirm', 'contest']),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new UnauthorizedError();

    const { id: editId } = await params;
    const body = await req.json();
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const vote = await voteOnEdit.execute({
      editId,
      voteType: parsed.data.voteType,
      userId: user.id,
    });

    return NextResponse.json(vote, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
