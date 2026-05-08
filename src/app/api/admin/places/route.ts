import { NextRequest, NextResponse } from 'next/server';
import { getPendingPlaces } from '@/presentation/lib/container';
import { requireAdmin, errorResponse } from '@/presentation/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const rawLimit = parseInt(searchParams.get('limit') ?? '20', 10);
    const rawOffset = parseInt(searchParams.get('offset') ?? '0', 10);

    const limit = Math.min(Math.max(rawLimit > 0 ? rawLimit : 20, 1), 100);
    const offset = rawOffset >= 0 ? rawOffset : 0;

    const result = await getPendingPlaces.execute({ limit, offset });
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
