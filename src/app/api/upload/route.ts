import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { ValidationError } from '@/application/errors/ValidationError';
import { adminStorageProvider } from '@/presentation/lib/container';
import { KIND_TO_PRESET } from '@/infrastructure/images/imageCompressionConfig';
import type { ImageKind } from '@/infrastructure/images/imageCompressionConfig';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const IMAGE_KINDS = [
  'place_cover',
  'place_logo',
  'place_gallery',
  'list_cover',
  'review_photo',
  'user_avatar',
] as const;

const kindSchema = z.enum(IMAGE_KINDS).optional().default('place_gallery');

export async function POST(req: NextRequest) {
  try {
    // Usar client autenticado para que RLS policies funcionem
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) throw new UnauthorizedError();

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new ValidationError('Arquivo inválido');

    // Validate kind and derive the max output size from the preset
    const kindResult = kindSchema.safeParse(form.get('kind') ?? undefined);
    const kind: ImageKind = kindResult.success ? kindResult.data : 'place_gallery';
    const preset = KIND_TO_PRESET[kind];

    if (file.size > preset.maxOutputBytes)
      throw new ValidationError(
        `Arquivo muito grande (máx ${Math.round(preset.maxOutputBytes / 1024)}KB para ${kind})`,
      );
    if (!ALLOWED_TYPES.includes(file.type))
      throw new ValidationError('Tipo de arquivo não suportado');

    const ext = file.type.split('/')[1];
    const path = `places/${user.id}/${Date.now()}.${ext}`;

    const url = await adminStorageProvider.upload(path, file);

    return NextResponse.json({ url });
  } catch (err) {
    return errorResponse(err);
  }
}
