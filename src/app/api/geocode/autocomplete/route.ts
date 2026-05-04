import { NextRequest, NextResponse } from 'next/server';
import { mapProvider } from '@/presentation/lib/container';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 3) {
    return NextResponse.json({ results: [] });
  }

  const results = await mapProvider.autocomplete(q.trim());
  return NextResponse.json({ results });
}
