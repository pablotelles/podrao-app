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
    house_number?: string;
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

export interface AutocompleteResult {
  lat: number;
  lng: number;
  displayName: string;
  displayPlace: string;
  displayAddress: string;
  address: {
    road?: string;
    houseNumber?: string;
    neighbourhood?: string;
    city?: string;
    state?: string;
  };
}

export interface IMapProvider {
  geocode(address: string): Promise<GeocodingResult | null>;
  reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodingResult | null>;
  autocomplete(query: string): Promise<AutocompleteResult[]>;
  getStaticMapUrl(options: StaticMapOptions): string;
  getTileUrlTemplate(): string;
}
