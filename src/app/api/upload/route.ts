import { NextRequest, NextResponse } from 'next/server';
import { storageProvider } from '@/presentation/lib/container';
import { getSession, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { ValidationError } from '@/application/errors/ValidationError';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new UnauthorizedError();

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new ValidationError('Arquivo inválido');
    if (file.size > MAX_SIZE) throw new ValidationError('Arquivo muito grande (máx 5 MB)');
    if (!ALLOWED_TYPES.includes(file.type)) throw new ValidationError('Tipo de arquivo não suportado');

    const ext = file.type.split('/')[1];
    const path = `places/${session.user.id}/${Date.now()}.${ext}`;
    const url = await storageProvider.upload(path, file);

    return NextResponse.json({ url });
  } catch (err) {
    return errorResponse(err);
  }
}
