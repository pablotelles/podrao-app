import { NextRequest, NextResponse } from 'next/server';
import { mapProvider, cacheProvider } from '@/presentation/lib/container';
import { errorResponse } from '@/presentation/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q?.trim()) {
      return NextResponse.json(
        { error: 'Parâmetro q obrigatório', code: 'INVALID_INPUT' },
        { status: 400 },
      );
    }

    const address = q.trim();
    const cacheKey = `geo:fwd:${address.toLowerCase()}`;

    try {
      const cached = await cacheProvider.get<object>(cacheKey);
      if (cached) return NextResponse.json(cached);
    } catch {
      // cache miss silencioso
    }

    const result = await mapProvider.geocode(address);
    if (!result) {
      return NextResponse.json(
        { error: 'Nenhum resultado encontrado', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    try {
      await cacheProvider.set(cacheKey, result, { ttl: 86400 });
    } catch {
      // falha de cache não quebra o response
    }

    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
