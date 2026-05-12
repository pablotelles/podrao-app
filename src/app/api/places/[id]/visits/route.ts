import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { registerVisit, getPlaceVisitStats } from '@/presentation/lib/container';
import { registerVisitSchema } from '@/presentation/lib/schemas/visitSchema';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: placeId } = await params;

    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new UnauthorizedError();

    const body = await req.json();
    const parsed = registerVisitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const visit = await registerVisit.execute({
      placeId,
      userId: user.id,
      recency: parsed.data.recency,
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: placeId } = await params;

    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const stats = await getPlaceVisitStats.execute({
      placeId,
      userId: user?.id,
    });

    return NextResponse.json(stats);
  } catch (err) {
    return errorResponse(err);
  }
}
