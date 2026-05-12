import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { searchAll } from '@/presentation/lib/container';
import { errorResponse } from '@/presentation/lib/api-helpers';

const searchSchema = z.object({
  q: z.string().min(2, 'Busca deve ter pelo menos 2 caracteres'),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const parsed = searchSchema.safeParse({
      q: searchParams.get('q') ?? '',
      limit: searchParams.get('limit') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const result = await searchAll.execute({
      q: parsed.data.q,
      limit: parsed.data.limit,
    });

    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
