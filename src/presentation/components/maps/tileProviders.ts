export interface TileProvider {
  url: string;
  maxZoom: number;
  label: string;
}

export const TILE_PROVIDERS = {
  /** Padrão do OSM — saturado, muita informação */
  osm: {
    label: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
  },
  /** Cinza suave — ótimo para apps onde os pins são protagonistas */
  cartodb_light: {
    label: 'CartoDB Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    maxZoom: 19,
  },
  /** Escuro elegante */
  cartodb_dark: {
    label: 'CartoDB Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    maxZoom: 19,
  },
  /** Cinza sem labels de texto nas ruas */
  cartodb_no_labels: {
    label: 'CartoDB Sem Labels',
    url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    maxZoom: 19,
  },
  /** Stadia suave e moderno */
  stadia_light: {
    label: 'Stadia Smooth',
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    maxZoom: 20,
  },
  /** Stadia escuro */
  stadia_dark: {
    label: 'Stadia Dark',
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    maxZoom: 20,
  },
} satisfies Record<string, TileProvider>;

// ─── TROCAR AQUI PARA MUDAR O MAPA GLOBALMENTE ───────────────────────────────
export const ACTIVE_TILE_PROVIDER: TileProvider = TILE_PROVIDERS.cartodb_light;
