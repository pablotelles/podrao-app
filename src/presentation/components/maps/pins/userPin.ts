/**
 * Gera o HTML do pin de localização do usuário.
 * Design: ponto azul sólido com anel pulsante — estilo Google Maps.
 * A animação `map-pulse` deve existir em globals.css.
 */
export function createUserPinHtml(): string {
  return `
    <div style="position:relative;width:24px;height:24px;">
      <div style="
        position:absolute;inset:0;
        background:var(--color-map-user-ring);
        border-radius:50%;
        animation:map-pulse 2s ease-out infinite;
      "></div>
      <div style="
        position:absolute;
        top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:14px;height:14px;
        background:var(--color-map-user);
        border:2.5px solid white;
        border-radius:50%;
        box-shadow:0 1px 6px var(--color-map-user-ring),0 1px 3px var(--color-map-user-shadow);
      "></div>
    </div>
  `.trim();
}

export const USER_PIN_SIZE: [number, number] = [24, 24];
export const USER_PIN_ANCHOR: [number, number] = [12, 12];
