import { NextRequest, NextResponse } from 'next/server';
import { getPlaceById, approvePlace } from '@/presentation/lib/container';
import { createPlaceSchema } from '@/presentation/lib/schemas/placeSchema';
import { errorResponse, getSession } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import type { PlaceStatus } from '@/domain/entities/Place';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const place = await getPlaceById.execute(id);
    return NextResponse.json(place);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) throw new UnauthorizedError();

    const { id } = await params;
    const body = await req.json();

    // Moderação: aprovar/rejeitar (apenas service role ou admin)
    if (body.status && (body.status === 'approved' || body.status === 'rejected')) {
      await approvePlace.execute(id, body.status as Extract<PlaceStatus, 'approved' | 'rejected'>);
      return NextResponse.json({ success: true });
    }

    // Edição parcial dos dados
    const parsed = createPlaceSchema.partial().safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten(), code: 'VALIDATION_ERROR' }, { status: 400 });

    const place = await getPlaceById.execute(id);
    if (place.createdBy !== session.user.id) throw new UnauthorizedError('Sem permissão para editar este lugar');

    return NextResponse.json(place);
  } catch (err) {
    return errorResponse(err);
  }
}
