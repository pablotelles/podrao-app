import { NextRequest, NextResponse } from 'next/server';
import { mapProvider, cacheProvider } from '@/presentation/lib/container';
import { errorResponse } from '@/presentation/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const lat = parseFloat(req.nextUrl.searchParams.get('lat') ?? '');
    const lng = parseFloat(req.nextUrl.searchParams.get('lng') ?? '');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'lat e lng são obrigatórios', code: 'INVALID_INPUT' },
        { status: 400 },
      );
    }

    const lat3 = Math.round(lat * 1000) / 1000;
    const lng3 = Math.round(lng * 1000) / 1000;
    const cacheKey = `geo:rev:${lat3}:${lng3}`;

    try {
      const cached = await cacheProvider.get<object>(cacheKey);
      if (cached) return NextResponse.json(cached);
    } catch {
      // cache miss silencioso
    }

    const result = await mapProvider.reverseGeocode(lat, lng);
    if (!result) {
      return NextResponse.json(
        { error: 'Endereço não encontrado', code: 'NOT_FOUND' },
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
