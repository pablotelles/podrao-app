import { NextResponse } from 'next/server';
import {
  getFeaturedListsCached,
  FEATURED_LISTS_LIMIT,
} from '@/presentation/lib/server/featured-lists';
import { errorResponse } from '@/presentation/lib/api-helpers';

export async function GET() {
  try {
    const items = await getFeaturedListsCached(FEATURED_LISTS_LIMIT);
    return NextResponse.json({ items });
  } catch (err) {
    return errorResponse(err);
  }
}
