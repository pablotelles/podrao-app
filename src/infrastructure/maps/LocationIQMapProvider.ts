import type {
  IMapProvider,
  GeocodingResult,
  ReverseGeocodingResult,
  StaticMapOptions,
} from '@/domain/interfaces/IMapProvider';

const BASE_URL = 'https://us1.locationiq.com/v1';

export class LocationIQMapProvider implements IMapProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('LocationIQ API key não fornecida');
    this.apiKey = apiKey;
  }

  async geocode(address: string): Promise<GeocodingResult | null> {
    const url = new URL(`${BASE_URL}/search`);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('q', address);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'br');

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
      address?: Record<string, string>;
    }>;
    if (!data.length) return null;

    const item = data[0];
    return {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
      address: {
        road: item.address?.road,
        neighbourhood: item.address?.neighbourhood ?? item.address?.suburb,
        city: item.address?.city ?? item.address?.town,
        state: item.address?.state,
        country: item.address?.country,
      },
    };
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodingResult | null> {
    const url = new URL(`${BASE_URL}/reverse`);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('format', 'json');

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = (await res.json()) as {
      display_name: string;
      address?: Record<string, string>;
    };

    return {
      displayName: data.display_name,
      address: {
        road: data.address?.road,
        neighbourhood: data.address?.neighbourhood ?? data.address?.suburb,
        city: data.address?.city ?? data.address?.town,
        state: data.address?.state,
      },
    };
  }

  getStaticMapUrl({ lat, lng, zoom = 15, width = 600, height = 300 }: StaticMapOptions): string {
    return (
      `https://maps.locationiq.com/v3/staticmap?key=${this.apiKey}` +
      `&center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&format=png`
    );
  }

  getTileUrlTemplate(): string {
    return `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`;
  }
}
