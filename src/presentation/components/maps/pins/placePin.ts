/**
 * Pin SVG vetorial para lugares no mapa.
 * Forma: teardrop real (arco circular + cauda bezier).
 * Ícone: Lucide Utensils embutido como path — sem dependência de React.
 */

export type PinSize = 'sm' | 'md' | 'lg';

interface PinConfig {
  w: number;
  h: number;
  stroke: number;
  iconSize: number; // px do ícone dentro do pin (em coord do SVG final)
}

const PIN_CONFIGS: Record<PinSize, PinConfig> = {
  sm: { w: 28, h: 38, stroke: 2,   iconSize: 11 },
  md: { w: 36, h: 48, stroke: 2.5, iconSize: 14 },
  lg: { w: 46, h: 61, stroke: 3,   iconSize: 18 },
};

/**
 * Paths do ícone Lucide `Utensils` (viewBox 0 0 24 24).
 * Extraído da lib para uso em string HTML sem React.
 */
const UTENSILS_PATHS = [
  'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2',
  'M7 2v20',
  'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7',
];

export function createPlacePinHtml(size: PinSize = 'md'): string {
  const { w, h, stroke, iconSize } = PIN_CONFIGS[size];

  const cx = w / 2;
  const r  = (w - stroke) / 2;   // raio do círculo
  const cy = r + stroke / 2;     // centro Y do círculo
  const lx = stroke / 2;         // x esquerdo do círculo
  const rx = w - stroke / 2;     // x direito do círculo

  // Teardrop: ponto inferior → bezier para borda esquerda →
  //           arco clockwise (topo) até borda direita →
  //           bezier de volta ao ponto
  const cp = r * 0.55; // curvatura da cauda
  const path = [
    `M${cx},${h - 1}`,
    `C${cx - cp},${h - 12} ${lx},${cy + cp} ${lx},${cy}`,
    `A${r},${r} 0 0,1 ${rx},${cy}`,
    `C${rx},${cy + cp} ${cx + cp},${h - 12} ${cx},${h - 1}Z`,
  ].join(' ');

  // Ícone: escala de 24 → iconSize, centralizado no círculo
  const s  = iconSize / 24;
  const tx = (cx - iconSize / 2).toFixed(2);
  const ty = (cy - iconSize / 2).toFixed(2);
  const sw = (2 / s).toFixed(2); // stroke-width no espaço original do ícone

  const paths = UTENSILS_PATHS.map((d) => `<path d="${d}"/>`).join('');

  return [
    `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"`,
    `xmlns="http://www.w3.org/2000/svg"`,
    `style="overflow:visible;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.28))">`,
    `<path d="${path}" fill="#f97316" stroke="white" stroke-width="${stroke}"`,
    `stroke-linejoin="round"/>`,
    `<g transform="translate(${tx},${ty}) scale(${s.toFixed(5)})"`,
    `stroke="white" stroke-width="${sw}"`,
    `stroke-linecap="round" stroke-linejoin="round" fill="none">`,
    paths,
    `</g>`,
    `</svg>`,
  ].join('');
}

/** Configuração do L.divIcon para cada tamanho */
export function getPinLeafletConfig(size: PinSize = 'md') {
  const { w, h } = PIN_CONFIGS[size];
  return {
    iconSize:    [w, h] as [number, number],
    iconAnchor:  [w / 2, h] as [number, number],
    popupAnchor: [0, -h + 6] as [number, number],
  };
}
