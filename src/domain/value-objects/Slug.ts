/**
 * Slug value object — pure TypeScript, zero external imports.
 * Builds SEO-friendly slugs from place/list names.
 */

/**
 * Builds a URL-safe slug from a name and cidade.
 * Appends a 2-char city abbreviation derived from the cidade string.
 *
 * Example: buildSlug("Marmitas do Ari", "São Paulo") → "marmitas-do-ari-sp"
 */
export function buildSlug(name: string, cidade: string): string {
  const normalize = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // strip combining chars (accents)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // keep only alphanumeric, spaces, hyphens
      .trim()
      .replace(/[\s-]+/g, '-') // collapse spaces/hyphens
      .replace(/^-+|-+$/g, ''); // strip leading/trailing hyphens

  const nameSlug = normalize(name);

  // City abbreviation: take first 2 alpha chars from normalized cidade
  const cidadeNorm = normalize(cidade).replace(/-/g, '');
  const sigla = cidadeNorm.slice(0, 2);

  return sigla ? `${nameSlug}-${sigla}` : nameSlug;
}

export async function generateUniqueSlug(
  base: string,
  findBySlug: (slug: string) => Promise<unknown>,
): Promise<string> {
  const existing = await findBySlug(base);
  if (!existing) return base;

  let counter = 2;
  while (counter < 100) {
    const candidate = `${base}-${counter}`;
    const found = await findBySlug(candidate);
    if (!found) return candidate;
    counter++;
  }
  return `${base}-${Date.now()}`;
}
