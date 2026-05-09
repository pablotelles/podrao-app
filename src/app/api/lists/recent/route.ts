import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRecentLists } from '@/presentation/lib/container';
import { errorResponse } from '@/presentation/lib/api-helpers';

const querySchema = z.object({
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius_km: z.coerce.number().positive().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const { lat, lng, radius_km, cursor, limit } = parsed.data;

    const result = await getRecentLists.execute({
      lat,
      lng,
      radiusKm: radius_km,
      cursor,
      limit,
    });

    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
