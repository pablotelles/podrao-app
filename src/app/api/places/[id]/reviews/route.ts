import { NextRequest, NextResponse } from 'next/server';
import { getPlaceReviews, submitReview } from '@/presentation/lib/container';
import { submitReviewSchema } from '@/presentation/lib/schemas/reviewSchema';
import { errorResponse, createRouteSupabaseClient } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reviews = await getPlaceReviews.execute(id);
    return NextResponse.json(reviews);
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

    const { id } = await params;
    const body = await req.json();
    const parsed = submitReviewSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );

    const review = await submitReview.execute({
      ...parsed.data,
      placeId: id,
      userId: user.id,
    });
    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
