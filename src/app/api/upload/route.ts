import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { ValidationError } from '@/application/errors/ValidationError';
import { SupabaseStorageProvider } from '@/infrastructure/storage/SupabaseStorageProvider';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
    if (file.size > MAX_SIZE) throw new ValidationError('Arquivo muito grande (máx 5 MB)');
    if (!ALLOWED_TYPES.includes(file.type))
      throw new ValidationError('Tipo de arquivo não suportado');

    const ext = file.type.split('/')[1];
    const path = `places/${user.id}/${Date.now()}.${ext}`;

    // Usar storage provider com client autenticado
    const storageProvider = new SupabaseStorageProvider(supabase);
    const url = await storageProvider.upload(path, file);

    return NextResponse.json({ url });
  } catch (err) {
    return errorResponse(err);
  }
}
