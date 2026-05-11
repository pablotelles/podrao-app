export type ImageKind =
  | 'place_cover'
  | 'place_logo'
  | 'place_gallery'
  | 'list_cover'
  | 'review_photo'
  | 'user_avatar';

export interface ImagePreset {
  maxWidth: number;
  maxHeight: number;
  /** 0..1 — quality passed to canvas.toBlob */
  quality: number;
  targetMime: 'image/webp' | 'image/jpeg';
  /** Maximum accepted output size in bytes (server-side defensive validation) */
  maxOutputBytes: number;
}

export const THUMBNAIL_PRESET: ImagePreset = {
  maxWidth: 512,
  maxHeight: 512,
  quality: 0.85,
  targetMime: 'image/webp',
  maxOutputBytes: 512 * 1024, // 512 KB
};

export const CONTENT_PRESET: ImagePreset = {
  maxWidth: 1600,
  maxHeight: 1200,
  quality: 0.82,
  targetMime: 'image/webp',
  maxOutputBytes: 2 * 1024 * 1024, // 2 MB
};

export const REVIEW_PRESET: ImagePreset = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.78,
  targetMime: 'image/webp',
  maxOutputBytes: 1.5 * 1024 * 1024, // 1.5 MB
};

const DEFAULT_KIND_TO_PRESET: Record<ImageKind, ImagePreset> = {
  place_logo: THUMBNAIL_PRESET,
  user_avatar: THUMBNAIL_PRESET,
  place_cover: CONTENT_PRESET,
  place_gallery: CONTENT_PRESET,
  list_cover: CONTENT_PRESET,
  review_photo: REVIEW_PRESET,
};

function buildKindToPreset(): Record<ImageKind, ImagePreset> {
  const overrideJson =
    typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_IMAGE_PRESETS_JSON ?? '') : '';

  if (!overrideJson) return DEFAULT_KIND_TO_PRESET;

  try {
    const overrides = JSON.parse(overrideJson) as Partial<Record<ImageKind, Partial<ImagePreset>>>;
    const result = { ...DEFAULT_KIND_TO_PRESET };
    for (const [kind, partial] of Object.entries(overrides) as [
      ImageKind,
      Partial<ImagePreset>,
    ][]) {
      if (result[kind]) {
        result[kind] = { ...result[kind], ...partial };
      }
    }
    return result;
  } catch {
    return DEFAULT_KIND_TO_PRESET;
  }
}

export const KIND_TO_PRESET: Record<ImageKind, ImagePreset> = buildKindToPreset();
