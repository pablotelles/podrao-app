import { NextResponse } from 'next/server';
import { getFeaturedLists } from '@/presentation/lib/container';
import { cacheProvider } from '@/presentation/lib/container';
import { errorResponse } from '@/presentation/lib/api-helpers';

const CACHE_KEY = 'lists:featured';
const CACHE_TTL = 3600;

export async function GET() {
  try {
    const cached = await cacheProvider.get<unknown>(CACHE_KEY);
    if (cached) {
      return NextResponse.json({ items: cached });
    }

    const items = await getFeaturedLists.execute({ limit: 4 });

    await cacheProvider.set(CACHE_KEY, items, { ttl: CACHE_TTL });

    return NextResponse.json({ items });
  } catch (err) {
    return errorResponse(err);
  }
}
