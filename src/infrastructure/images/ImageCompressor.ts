import { KIND_TO_PRESET } from './imageCompressionConfig';
import type { ImageKind } from './imageCompressionConfig';

/**
 * Compresses a File client-side using the Canvas API.
 * - Corrects EXIF orientation via createImageBitmap imageOrientation option
 * - Resizes proportionally to fit within the preset's maxWidth × maxHeight
 * - Encodes as WebP (falls back to JPEG if the browser returns null for WebP)
 * - Returns a new File with the same base name but .webp (or .jpg) extension
 *
 * Must be called only in browser context (window, Worker, etc.) — never in Node.js.
 */
export async function compressImage(file: File, kind: ImageKind): Promise<File> {
  if (typeof document === 'undefined')
    throw new Error('[ImageCompressor] compressImage must be called in browser context');

  const preset = KIND_TO_PRESET[kind];

  // createImageBitmap handles EXIF orientation natively in modern browsers
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

  const { width: srcW, height: srcH } = bitmap;
  const { maxWidth, maxHeight } = preset;

  // Proportional resize — never upscale
  const scale = Math.min(1, maxWidth / srcW, maxHeight / srcH);
  const dstW = Math.round(srcW * scale);
  const dstH = Math.round(srcH * scale);

  const canvas = document.createElement('canvas');
  canvas.width = dstW;
  canvas.height = dstH;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    // Return original file if canvas 2d context is unavailable
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, dstW, dstH);
  bitmap.close();

  const blob = await tryToBlob(canvas, preset.targetMime, preset.quality);
  const mime = blob.type;
  const ext = mime === 'image/webp' ? 'webp' : 'jpg';

  const baseName = file.name.replace(/\.[^.]+$/, '');
  const compressedFile = new File([blob], `${baseName}.${ext}`, { type: mime });

  if (process.env.NODE_ENV === 'development') {
    console.info(
      `[ImageCompressor] kind=${kind} preset=${preset.targetMime} ` +
        `original=${formatBytes(file.size)} → compressed=${formatBytes(compressedFile.size)} ` +
        `dims=${srcW}×${srcH}→${dstW}×${dstH}`,
    );
  }

  return compressedFile;
}

function tryToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        // WebP not supported — fall back to JPEG
        if (mime !== 'image/jpeg') {
          canvas.toBlob(
            (fallback) => {
              if (fallback) {
                resolve(fallback);
              } else {
                reject(new Error('canvas.toBlob returned null for both WebP and JPEG'));
              }
            },
            'image/jpeg',
            quality,
          );
        } else {
          reject(new Error('canvas.toBlob returned null'));
        }
      },
      mime,
      quality,
    );
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}
