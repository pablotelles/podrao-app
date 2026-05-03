import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyPlaces, createPlace } from '@/presentation/lib/container';
import { searchPlacesSchema, createPlaceSchema } from '@/presentation/lib/schemas/placeSchema';
import { errorResponse, getSession } from '@/presentation/lib/api-helpers';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = searchPlacesSchema.safeParse(params);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten(), code: 'VALIDATION_ERROR' }, { status: 400 });

    const { lat, lng, radius, meal, cuisine, maxPrice, limit, offset } = parsed.data;
    const places = await searchNearbyPlaces.execute({
      lat,
      lng,
      radiusMeters: radius,
      mealType: meal,
      cuisine,
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
    const session = await getSession();
    if (!session) throw new UnauthorizedError();

    const body = await req.json();
    const parsed = createPlaceSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten(), code: 'VALIDATION_ERROR' }, { status: 400 });

    const place = await createPlace.execute({ ...parsed.data, createdBy: session.user.id });
    return NextResponse.json(place, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
