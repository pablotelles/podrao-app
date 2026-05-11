import { NextRequest, NextResponse } from 'next/server';
import { mapProvider } from '@/presentation/lib/container';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q?.trim()) {
    return NextResponse.json({ error: 'Parâmetro q obrigatório' }, { status: 400 });
  }

  const result = await mapProvider.geocode(q.trim());
  if (!result) {
    return NextResponse.json({ error: 'Nenhum resultado encontrado' }, { status: 404 });
  }

  return NextResponse.json(result);
}
