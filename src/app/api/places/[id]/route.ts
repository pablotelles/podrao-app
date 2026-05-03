import { NextRequest, NextResponse } from 'next/server';
import { approvePlace } from '@/presentation/lib/container';
import { createPlaceSchema } from '@/presentation/lib/schemas/placeSchema';
import {
  createRouteSupabaseClient,
  errorResponse,
  getSession,
} from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { SupabasePlaceRepository } from '@/infrastructure/database/supabase/SupabasePlaceRepository';
import { SupabaseStorageProvider } from '@/infrastructure/storage/SupabaseStorageProvider';
import { GetPlaceById } from '@/application/use-cases/places/GetPlaceById';
import type { PlaceStatus } from '@/domain/entities/Place';

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
    const session = await getSession();
    if (!session) throw new UnauthorizedError();

    const { id } = await params;
    const body = await req.json();

    // Moderação: aprovar/rejeitar (apenas service role ou admin)
    if (body.status && (body.status === 'approved' || body.status === 'rejected')) {
      await approvePlace.execute(id, body.status as Extract<PlaceStatus, 'approved' | 'rejected'>);
      return NextResponse.json({ success: true });
    }

    // Edição parcial dos dados (incluindo photo_url)
    const parsed = createPlaceSchema.partial().safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );

    // Usar client autenticado para verificar permissão
    const supabase = await createRouteSupabaseClient();
    const placeRepository = new SupabasePlaceRepository(supabase);
    const getPlaceById = new GetPlaceById(placeRepository);

    const place = await getPlaceById.execute(id);
    if (!place) throw new PlaceNotFoundError(id);
    if (place.createdBy !== session.user.id)
      throw new UnauthorizedError('Sem permissão para editar este lugar');

    // Se estiver atualizando foto, gerenciar place_photos table
    if (parsed.data.photoUrl) {
      const storageProvider = new SupabaseStorageProvider(supabase);

      // Buscar logo atual
      const currentPhotos = await placeRepository.getPlacePhotos(id);
      const currentLogo = currentPhotos.find((p) => p.type === 'logo');

      // Se existe logo antigo, deletar do storage e da tabela
      if (currentLogo) {
        await storageProvider.deleteByUrl(currentLogo.url);
        await placeRepository.deletePlacePhoto(currentLogo.id);
      }

      // Adicionar novo logo
      await placeRepository.addPlacePhoto(id, parsed.data.photoUrl, 'logo');

      // Remover photoUrl do parsed.data para não tentar atualizar o campo DEPRECATED
      delete parsed.data.photoUrl;
    }

    // Atualizar apenas os campos fornecidos
    const updated = await placeRepository.update(id, parsed.data);
    return NextResponse.json(updated);
  } catch (err) {
    return errorResponse(err);
  }
}
