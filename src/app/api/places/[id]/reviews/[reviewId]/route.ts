import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { ValidationError } from '@/application/errors/ValidationError';
import { SupabaseReviewRepository } from '@/infrastructure/database/supabase/SupabaseReviewRepository';
import { createAdminClient } from '@/infrastructure/database/supabase/client';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> },
) {
  try {
    const { reviewId } = await params;

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

    const isAdmin = user.app_metadata?.role === 'admin';
    if (review.userId !== user.id && !isAdmin)
      throw new UnauthorizedError('Sem permissão para excluir esta avaliação');

    await reviewRepo.delete(reviewId);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
