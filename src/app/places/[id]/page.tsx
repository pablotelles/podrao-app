import { notFound, permanentRedirect } from 'next/navigation';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { createServerSupabaseClient } from '@/presentation/lib/api-helpers';
import { SupabasePlaceRepository } from '@/infrastructure/database/supabase/SupabasePlaceRepository';
import { GetPlaceById } from '@/application/use-cases/places/GetPlaceById';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlaceDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    const supabase = await createServerSupabaseClient();
    const repo = new SupabasePlaceRepository(supabase);
    const place = await new GetPlaceById(repo).execute(id);

    if (place.slug) permanentRedirect(`/p/${place.slug}`);
    notFound();
  } catch (err) {
    if (err instanceof PlaceNotFoundError) notFound();
    throw err;
  }
}
