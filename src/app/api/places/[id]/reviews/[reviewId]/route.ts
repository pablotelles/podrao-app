import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { ValidationError } from '@/application/errors/ValidationError';
import { SupabaseReviewRepository } from '@/infrastructure/database/supabase/SupabaseReviewRepository';
import { createAdminClient } from '@/infrastructure/database/supabase/client';
import { cacheProvider } from '@/presentation/lib/container';

type Params = { params: Promise<{ id: string; reviewId: string }> };

async function getAuthAndReview(reviewId: string) {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new UnauthorizedError();

  const adminClient = createAdminClient();
  const reviewRepo = new SupabaseReviewRepository(adminClient);
  const review = await reviewRepo.findById(reviewId);
  if (!review) throw new ValidationError('Avaliação não encontrada');

  return { user, reviewRepo, review };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { reviewId } = await params;
    const { user, review } = await getAuthAndReview(reviewId);
    if (review.userId !== user.id) throw new UnauthorizedError();
    return NextResponse.json(review);
  } catch (err) {
    return errorResponse(err);
  }
}

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  priceBucket: z.enum(['up_to_25', '25_to_45', '45_to_80', 'above_80']).optional(),
  comment: z.string().max(1500).optional(),
  scores: z
    .array(
      z.object({
        category: z.enum(['food', 'service', 'value']),
        score: z.number().int().min(1).max(5),
      }),
    )
    .optional(),
  photoUrls: z.array(z.string().url()).max(5).optional(),
});

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { reviewId } = await params;
    const { user, reviewRepo, review } = await getAuthAndReview(reviewId);
    if (review.userId !== user.id)
      throw new UnauthorizedError('Sem permissão para editar esta avaliação');

    const body = await req.json();
    const parsed = updateReviewSchema.safeParse(body);
    if (!parsed.success)
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Dados inválidos');

    const updated = await reviewRepo.update(reviewId, parsed.data);
    await cacheProvider.del(`reviews:place:${review.placeId}`);
    return NextResponse.json(updated);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { reviewId } = await params;
    const { user, reviewRepo, review } = await getAuthAndReview(reviewId);

    const isAdmin = user.app_metadata?.role === 'admin';
    if (review.userId !== user.id && !isAdmin)
      throw new UnauthorizedError('Sem permissão para excluir esta avaliação');

    await reviewRepo.delete(reviewId);
    await cacheProvider.del(`reviews:place:${review.placeId}`);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
