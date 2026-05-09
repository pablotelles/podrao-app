export function priceText(min: number | null, max: number | null): string | null {
  if (min === null) return null;
  if (max === null || max === min) return `R$${min}`;
  return `R$${min}–${max}`;
}

/** Formato longo: "1 pessoa salvou" / "N pessoas salvaram" */
export function savesTextLong(count: number): string {
  return count === 1 ? '1 pessoa salvou' : `${count} pessoas salvaram`;
}

/** Formato curto: "1 salvou" / "N salvaram" */
export function savesTextShort(count: number): string {
  return count === 1 ? '1 salvou' : `${count} salvaram`;
}
