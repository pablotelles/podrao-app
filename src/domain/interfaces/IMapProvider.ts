export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  address?: {
    road?: string;
    neighbourhood?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface ReverseGeocodingResult {
  displayName: string;
  address?: {
    road?: string;
    neighbourhood?: string;
    city?: string;
    state?: string;
  };
}

export interface StaticMapOptions {
  lat: number;
  lng: number;
  zoom?: number;
  width?: number;
  height?: number;
}

export interface IMapProvider {
  geocode(address: string): Promise<GeocodingResult | null>;
  reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodingResult | null>;
  getStaticMapUrl(options: StaticMapOptions): string;
  getTileUrlTemplate(): string;
}
