import type {
  IMapProvider,
  GeocodingResult,
  ReverseGeocodingResult,
  AutocompleteResult,
  StaticMapOptions,
} from '@/domain/interfaces/IMapProvider';

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const STATIC_MAP_URL = 'https://maps.googleapis.com/maps/api/staticmap';

type AddressComponent = { long_name: string; types: string[] };

function extractComponent(components: AddressComponent[], ...types: string[]): string | undefined {
  for (const type of types) {
    const match = components.find((c) => c.types.includes(type));
    if (match) return match.long_name;
  }
  return undefined;
}

export class GoogleMapsMapProvider implements IMapProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('Google Maps API key não fornecida');
    this.apiKey = apiKey;
  }

  async geocode(address: string): Promise<GeocodingResult | null> {
    try {
      const url = new URL(GEOCODE_URL);
      url.searchParams.set('address', address);
      url.searchParams.set('key', this.apiKey);
      url.searchParams.set('region', 'br');
      url.searchParams.set('language', 'pt-BR');
      url.searchParams.set('components', 'country:BR');

      const res = await fetch(url.toString());
      if (!res.ok) return null;

      const data = (await res.json()) as {
        status: string;
        results: Array<{
          formatted_address: string;
          geometry: { location: { lat: number; lng: number } };
          address_components: AddressComponent[];
        }>;
      };

      if (data.status !== 'OK' || !data.results.length) return null;

      const item = data.results[0];
      const comps = item.address_components;

      return {
        lat: item.geometry.location.lat,
        lng: item.geometry.location.lng,
        displayName: item.formatted_address,
        address: {
          road: extractComponent(comps, 'route'),
          neighbourhood: extractComponent(comps, 'sublocality_level_1', 'neighborhood'),
          city: extractComponent(comps, 'administrative_area_level_2'),
          state: extractComponent(comps, 'administrative_area_level_1'),
          country: extractComponent(comps, 'country'),
        },
      };
    } catch {
      return null;
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodingResult | null> {
    try {
      const url = new URL(GEOCODE_URL);
      url.searchParams.set('latlng', `${lat},${lng}`);
      url.searchParams.set('key', this.apiKey);
      url.searchParams.set('language', 'pt-BR');

      const res = await fetch(url.toString());
      if (!res.ok) return null;

      const data = (await res.json()) as {
        status: string;
        results: Array<{
          formatted_address: string;
          address_components: AddressComponent[];
        }>;
      };

      if (data.status !== 'OK' || !data.results.length) return null;

      const item = data.results[0];
      const comps = item.address_components;

      return {
        displayName: item.formatted_address,
        address: {
          road: extractComponent(comps, 'route'),
          house_number: extractComponent(comps, 'street_number'),
          neighbourhood: extractComponent(comps, 'sublocality_level_1', 'neighborhood'),
          city: extractComponent(comps, 'administrative_area_level_2'),
          state: extractComponent(comps, 'administrative_area_level_1'),
        },
      };
    } catch {
      return null;
    }
  }

  async autocomplete(query: string): Promise<AutocompleteResult[]> {
    try {
      const acUrl = new URL(AUTOCOMPLETE_URL);
      acUrl.searchParams.set('input', query);
      acUrl.searchParams.set('key', this.apiKey);
      acUrl.searchParams.set('components', 'country:br');
      acUrl.searchParams.set('language', 'pt-BR');
      acUrl.searchParams.set('types', 'address');

      console.log(
        '[GoogleMaps] autocomplete request:',
        acUrl.toString().replace(this.apiKey, '***'),
      );
      const acRes = await fetch(acUrl.toString());
      console.log('[GoogleMaps] autocomplete HTTP status:', acRes.status);
      if (!acRes.ok) return [];

      const acData = (await acRes.json()) as {
        status: string;
        error_message?: string;
        predictions: Array<{ place_id: string; description: string }>;
      };

      console.log(
        '[GoogleMaps] autocomplete API status:',
        acData.status,
        '| predictions:',
        acData.predictions?.length ?? 0,
        acData.error_message ? `| error: ${acData.error_message}` : '',
      );
      if (acData.status !== 'OK' || !acData.predictions.length) return [];

      const predictions = acData.predictions.slice(0, 5);
      console.log('[GoogleMaps] fetching details for', predictions.length, 'predictions');

      const details = await Promise.all(
        predictions.map(async (pred) => {
          const detailUrl = new URL(PLACE_DETAILS_URL);
          detailUrl.searchParams.set('place_id', pred.place_id);
          detailUrl.searchParams.set('key', this.apiKey);
          detailUrl.searchParams.set(
            'fields',
            'geometry,formatted_address,address_components,name',
          );
          detailUrl.searchParams.set('language', 'pt-BR');

          try {
            const detailRes = await fetch(detailUrl.toString());
            if (!detailRes.ok) {
              console.log(
                '[GoogleMaps] place details HTTP error:',
                detailRes.status,
                'for place_id:',
                pred.place_id,
              );
              return null;
            }

            const detailData = (await detailRes.json()) as {
              status: string;
              error_message?: string;
              result: {
                formatted_address: string;
                geometry: { location: { lat: number; lng: number } };
                address_components: AddressComponent[];
              };
            };

            console.log(
              '[GoogleMaps] place details status:',
              detailData.status,
              'for place_id:',
              pred.place_id,
              detailData.error_message ? `| error: ${detailData.error_message}` : '',
            );
            if (detailData.status !== 'OK') return null;
            return detailData.result;
          } catch (err) {
            console.error('[GoogleMaps] place details exception for place_id:', pred.place_id, err);
            return null;
          }
        }),
      );

      console.log(
        '[GoogleMaps] details resolved:',
        details.filter(Boolean).length,
        '/',
        predictions.length,
      );

      const mapped = details
        .filter((d): d is NonNullable<typeof d> => d !== null)
        .map((detail) => {
          const comps = detail.address_components;
          const formatted = detail.formatted_address;
          const commaIdx = formatted.indexOf(',');
          const displayPlace = commaIdx >= 0 ? formatted.slice(0, commaIdx).trim() : formatted;
          const displayAddress = commaIdx >= 0 ? formatted.slice(commaIdx + 1).trim() : '';

          return {
            lat: detail.geometry.location.lat,
            lng: detail.geometry.location.lng,
            displayName: formatted,
            displayPlace,
            displayAddress,
            address: {
              road: extractComponent(comps, 'route'),
              houseNumber: extractComponent(comps, 'street_number'),
              neighbourhood: extractComponent(comps, 'sublocality_level_1', 'neighborhood'),
              city: extractComponent(comps, 'administrative_area_level_2'),
              state: extractComponent(comps, 'administrative_area_level_1'),
            },
          };
        });

      console.log('[GoogleMaps] autocomplete returning', mapped.length, 'results');
      return mapped;
    } catch (err) {
      console.error('[GoogleMaps] autocomplete exception:', err);
      return [];
    }
  }

  getStaticMapUrl({ lat, lng, zoom = 15, width = 600, height = 300 }: StaticMapOptions): string {
    return (
      `${STATIC_MAP_URL}?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}` +
      `&key=${this.apiKey}&markers=color:purple|${lat},${lng}`
    );
  }

  getTileUrlTemplate(): string {
    return '';
  }
}
