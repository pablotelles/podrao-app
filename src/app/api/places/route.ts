import { NextRequest, NextResponse } from 'next/server';
import {
  searchNearbyPlaces,
  sendPlaceLifecycleEmail,
  cacheProvider,
} from '@/presentation/lib/container';
import { searchPlacesSchema, createPlaceSchema } from '@/presentation/lib/schemas/placeSchema';
import { createRouteSupabaseClient, errorResponse } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { SupabasePlaceRepository } from '@/infrastructure/database/supabase/SupabasePlaceRepository';
import { CreatePlace } from '@/application/use-cases/places/CreatePlace';
import { createAdminClient } from '@/infrastructure/database/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = searchPlacesSchema.safeParse(params);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );

    const {
      lat,
      lng,
      radius,
      period,
      establishmentType,
      attributeKey,
      attributeValue,
      maxPrice,
      limit,
      offset,
    } = parsed.data;
    const places = await searchNearbyPlaces.execute({
      lat,
      lng,
      radiusMeters: radius,
      period,
      establishmentType,
      attributeKey,
      attributeValue,
      maxPrice,
      limit,
      offset,
    });

    return NextResponse.json(places);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validar autenticação com client normal (lê cookies)
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) throw new UnauthorizedError();

    // 2. Usar admin client para bypass de RLS (seguro pois já validamos auth)
    const adminClient = createAdminClient();
    const placeRepository = new SupabasePlaceRepository(adminClient);
    const createPlace = new CreatePlace(placeRepository, cacheProvider, sendPlaceLifecycleEmail);

    const body = await req.json();
    const parsed = createPlaceSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 },
      );

    const place = await createPlace.execute({ ...parsed.data, userId: user.id });

    // Se foi enviado photoUrl, adicionar na tabela place_photos
    if (parsed.data.photoUrl) {
      await placeRepository.addPlacePhoto(place.id, parsed.data.photoUrl, 'logo');
    }

    return NextResponse.json(place, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
