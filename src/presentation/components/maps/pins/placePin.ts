export function createPlacePinHtml(selected = false): string {
  const size = selected ? 42 : 36;
  const iconSize = selected ? 18 : 15;
  const shadow = selected
    ? '0 4px 16px rgba(249,115,22,0.5),0 2px 6px rgba(0,0,0,0.2)'
    : '0 2px 8px rgba(0,0,0,0.2)';

  return `
    <div style="
      position:relative;
      width:${size}px;
      height:${size + 8}px;
      display:flex;
      flex-direction:column;
      align-items:center;
      filter:drop-shadow(0 2px 4px rgba(0,0,0,0.15));
      transition:transform 0.15s ease;
    ">
      <div style="
        width:${size}px;height:${size}px;
        background:#f97316;
        border:2.5px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:${shadow};
        display:flex;align-items:center;justify-content:center;
        flex-shrink:0;
      ">
        <span style="
          transform:rotate(45deg);
          font-size:${iconSize}px;
          line-height:1;
          display:block;
        ">🍴</span>
      </div>
    </div>
  `.trim();
}

export const PLACE_PIN_SIZE: [number, number] = [36, 44];
export const PLACE_PIN_ANCHOR: [number, number] = [18, 44];

export const PLACE_PIN_SIZE_SELECTED: [number, number] = [42, 50];
export const PLACE_PIN_ANCHOR_SELECTED: [number, number] = [21, 50];
