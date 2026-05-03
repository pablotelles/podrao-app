import { NextRequest, NextResponse } from 'next/server';
import { mapProvider } from '@/presentation/lib/container';

export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get('lat') ?? '');
  const lng = parseFloat(req.nextUrl.searchParams.get('lng') ?? '');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat e lng são obrigatórios' }, { status: 400 });
  }

  const result = await mapProvider.reverseGeocode(lat, lng);
  if (!result) {
    return NextResponse.json({ error: 'Endereço não encontrado' }, { status: 404 });
  }

  return NextResponse.json(result);
}
