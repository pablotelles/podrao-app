export class Coordinates {
  readonly lat: number;
  readonly lng: number;

  constructor(lat: number, lng: number) {
    if (lat < -90 || lat > 90) throw new Error(`Latitude inválida: ${lat}`);
    if (lng < -180 || lng > 180) throw new Error(`Longitude inválida: ${lng}`);
    this.lat = lat;
    this.lng = lng;
  }

  equals(other: Coordinates): boolean {
    return this.lat === other.lat && this.lng === other.lng;
  }
}
