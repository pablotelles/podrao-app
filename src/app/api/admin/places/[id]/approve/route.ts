import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { approvePlace } from '@/presentation/lib/container';
import { requireAdmin, errorResponse } from '@/presentation/lib/api-helpers';

const paramsSchema = z.object({ id: z.string().uuid() });

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    const { id } = await params;

    const parsed = paramsSchema.safeParse({ id });
    if (!parsed.success) {
      return NextResponse.json({ error: 'ID inválido', code: 'VALIDATION_ERROR' }, { status: 400 });
    }

    await approvePlace.execute(id);

    return NextResponse.json({
      success: true,
      message: 'Lugar aprovado com sucesso',
      place: { id, status: 'approved', updatedBy: user.id },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
