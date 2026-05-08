import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rejectPlace } from '@/presentation/lib/container';
import { requireAdmin, errorResponse } from '@/presentation/lib/api-helpers';

const paramsSchema = z.object({ id: z.string().uuid() });
const bodySchema = z.object({ reason: z.string().min(5).max(255) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    const { id } = await params;

    const parsedParams = paramsSchema.safeParse({ id });
    if (!parsedParams.success) {
      return NextResponse.json({ error: 'ID inválido', code: 'VALIDATION_ERROR' }, { status: 400 });
    }

    const body = await req.json();
    const parsedBody = bodySchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const place = await rejectPlace.execute({
      placeId: id,
      reason: parsedBody.data.reason,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Lugar rejeitado com sucesso',
      place: {
        id: place.id,
        status: place.status,
        rejection_reason: place.rejectionReason,
        updated_at: place.updatedAt,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
