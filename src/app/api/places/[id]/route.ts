import { NextRequest, NextResponse } from 'next/server';
import { approvePlace, rejectPlace, cacheProvider } from '@/presentation/lib/container';
import { createPlaceSchema } from '@/presentation/lib/schemas/placeSchema';
import {
  createRouteSupabaseClient,
  requireAdmin,
  errorResponse,
} from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { SupabasePlaceRepository } from '@/infrastructure/database/supabase/SupabasePlaceRepository';
import { SupabaseStorageProvider } from '@/infrastructure/storage/SupabaseStorageProvider';
import { GetPlaceById } from '@/application/use-cases/places/GetPlaceById';
import { createAdminClient } from '@/infrastructure/database/supabase/client';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Usar client autenticado para permitir leitura de lugares próprios (pending)
    const supabase = await createRouteSupabaseClient();
    const placeRepository = new SupabasePlaceRepository(supabase);
    const getPlaceById = new GetPlaceById(placeRepository);

    const place = await getPlaceById.execute(id);
    return NextResponse.json(place);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Validar autenticação
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new UnauthorizedError();

    const { id } = await params;
    const body = await req.json();

    // Moderação: aprovar/rejeitar — exclusivo para admins
    if (body.status && (body.status === 'approved' || body.status === 'rejected')) {
      await requireAdmin();
      if (body.status === 'approved') {
        await approvePlace.execute(id);
      } else {
        await rejectPlace.execute({
          placeId: id,
          reason: typeof body.rejectionReason === 'string' ? body.rejectionReason : '',
          userId: user.id,
        });
      }
      return NextResponse.json({ success: true });
    }

    // Edição parcial dos dados (incluindo photo_url)
    const parsed = createPlaceSchema.partial().safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );

    // 2. Buscar place para validar ownership
    // (usa client autenticado apenas para busca)
    const placeRepository = new SupabasePlaceRepository(supabase);
    const getPlaceById = new GetPlaceById(placeRepository);
    const place = await getPlaceById.execute(id);
    if (!place) throw new PlaceNotFoundError(id);

    // 3. Validar ownership no código (business logic)
    if (place.createdBy !== user.id)
      throw new UnauthorizedError('Sem permissão para editar este lugar');

    // 4. Usar admin client para update (bypass de RLS após validação)
    const adminClient = createAdminClient();
    const adminPlaceRepo = new SupabasePlaceRepository(adminClient);
    const adminStorageProvider = new SupabaseStorageProvider();

    // Se estiver atualizando foto, gerenciar place_photos table
    if (parsed.data.photoUrl) {
      // Buscar logo atual
      const currentPhotos = await adminPlaceRepo.getPlacePhotos(id);
      const currentLogo = currentPhotos.find((p) => p.type === 'logo');

      // Se existe logo antigo, deletar do storage e da tabela
      if (currentLogo) {
        await adminStorageProvider.deleteByUrl(currentLogo.url);
        await adminPlaceRepo.deletePlacePhoto(currentLogo.id);
      }

      // Adicionar novo logo
      await adminPlaceRepo.addPlacePhoto(id, parsed.data.photoUrl, 'logo');

      delete parsed.data.photoUrl;
    }

    const hasFieldsToUpdate = Object.keys(parsed.data).length > 0;
    const updated = hasFieldsToUpdate
      ? await adminPlaceRepo.update(id, parsed.data)
      : await getPlaceById.execute(id);

    // Invalidate slug cache after any field update
    if (updated?.slug) {
      await cacheProvider.del(`place:slug:${updated.slug}`);
    }

    return NextResponse.json(updated);
  } catch (err) {
    return errorResponse(err);
  }
}
