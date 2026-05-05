import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SupabasePlaceRepository } from '@/infrastructure/database/supabase/SupabasePlaceRepository';
import { createAdminClient } from '@/infrastructure/database/supabase/client';
import { errorResponse } from '@/presentation/lib/api-helpers';

const searchSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
});

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = searchSchema.safeParse(params);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );

    const adminClient = createAdminClient();
    const placeRepo = new SupabasePlaceRepository(adminClient);
    const places = await placeRepo.searchByName(parsed.data.q, parsed.data.limit);

    return NextResponse.json(places);
  } catch (err) {
    return errorResponse(err);
  }
}
