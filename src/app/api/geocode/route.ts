import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q?.trim()) {
    return NextResponse.json({ error: 'Parâmetro q obrigatório' }, { status: 400 });
  }

  const apiKey = process.env.LOCATIONIQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Serviço de geocoding não configurado' }, { status: 503 });
  }

  const url = new URL('https://us1.locationiq.com/v1/search');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'br');

  const res = await fetch(url.toString());
  if (!res.ok) {
    return NextResponse.json({ error: 'Nenhum resultado encontrado' }, { status: 404 });
  }

  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!data.length) {
    return NextResponse.json({ error: 'Nenhum resultado encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  });
}
