import { NextRequest, NextResponse } from 'next/server';
import { mapProvider, cacheProvider } from '@/presentation/lib/container';
import { errorResponse } from '@/presentation/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q || q.trim().length < 3) {
      return NextResponse.json({ results: [] });
    }

    const trimmed = q.trim();
    const cacheKey = `geo:ac:${trimmed.toLowerCase().slice(0, 50)}`;

    try {
      const cached = await cacheProvider.get<object[]>(cacheKey);
      if (cached) return NextResponse.json({ results: cached });
    } catch {
      // cache miss silencioso
    }

    const results = await mapProvider.autocomplete(trimmed);

    try {
      await cacheProvider.set(cacheKey, results, { ttl: 300 });
    } catch {
      // falha de cache não quebra o response
    }

    return NextResponse.json({ results });
  } catch (err) {
    return errorResponse(err);
  }
}
