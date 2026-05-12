import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { proposeEdit, listPendingEditsForPlace } from '@/presentation/lib/container';
import {
  createRouteSupabaseClient,
  getSession,
  errorResponse,
} from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

const proposeEditSchema = z.object({
  fieldName: z.string().min(1),
  newValue: z.unknown(),
  note: z.string().max(280).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new UnauthorizedError();

    const { id: placeId } = await params;
    const body = await req.json();
    const parsed = proposeEditSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const result = await proposeEdit.execute({
      placeId,
      fieldName: parsed.data.fieldName,
      newValue: parsed.data.newValue,
      note: parsed.data.note,
      userId: user.id,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: placeId } = await params;
    const viewer = await getSession();

    const edits = await listPendingEditsForPlace.execute({
      placeId,
      viewerUserId: viewer?.id,
    });

    return NextResponse.json(edits);
  } catch (err) {
    return errorResponse(err);
  }
}
