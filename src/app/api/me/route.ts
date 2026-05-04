import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { SupabaseUserRepository } from '@/infrastructure/database/supabase/SupabaseUserRepository';
import { UpdateProfile } from '@/application/use-cases/user/UpdateProfile';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { z } from 'zod';

export async function GET() {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) throw new UnauthorizedError();

    // Repository pode usar qualquer cliente - só faz SELECT (policy aberta)
    const userRepository = new SupabaseUserRepository();
    const user = await userRepository.findById(authUser.id);

    // Profile pode não existir ainda (migration pendente ou usuário antigo sem perfil).
    // Retorna dados básicos do auth para não bloquear o acesso à conta.
    if (!user) {
      const emailLocal = authUser.email?.split('@')[0] ?? authUser.id.slice(0, 8);
      return NextResponse.json({
        id: authUser.id,
        email: authUser.email ?? '',
        nickname: emailLocal,
        createdAt: new Date(),
      });
    }

    return NextResponse.json(user);
  } catch (err) {
    return errorResponse(err);
  }
}

const updateSchema = z.object({
  nickname: z
    .string()
    .regex(/^[a-z0-9_]{3,30}$/, 'Nickname inválido')
    .optional(),
  name: z.string().max(80).optional(),
  headline: z.string().max(160).optional(),
  avatarUrl: z.union([z.string().url(), z.literal('')]).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) throw new UnauthorizedError();

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    // Repository usa admin client internamente para bypass de RLS
    // Autenticação já validada acima via authUser
    const userRepository = new SupabaseUserRepository();
    const updateProfile = new UpdateProfile(userRepository);
    const user = await updateProfile.execute({ userId: authUser.id, ...parsed.data });
    return NextResponse.json(user);
  } catch (err) {
    return errorResponse(err);
  }
}
