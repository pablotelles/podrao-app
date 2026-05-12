import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/presentation/lib/api-helpers';
import { createAdminClient } from '@/infrastructure/database/supabase/client';
import { SupabaseListRepository } from '@/infrastructure/database/supabase/SupabaseListRepository';
import {
  getListById,
  getListBySlug,
  getListPlaces,
  getPlaceById,
} from '@/presentation/lib/container';
import { ListDetailHeader } from '@/presentation/components/lists/ListDetailHeader';
import { ListMetadata } from '@/presentation/components/lists/ListMetadata';
import { ListPlacesSection } from '@/presentation/components/lists/ListPlacesSection';
import { ListStatsBarWrapper } from '@/presentation/components/lists/ListStatsBarWrapper';
import { ExpandableText } from '@/presentation/components/ui/ExpandableText';
import { PageContent } from '@/presentation/components/ui/PageContent';
import { PageTitle } from '@/presentation/contexts/TopBarContext';
import { buildListMetadata } from '@/presentation/lib/seo';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Props {
  params: Promise<{ id: string }>;
}

async function resolveList(id: string) {
  return UUID_REGEX.test(id) ? getListById.execute({ listId: id }) : getListBySlug.execute(id);
}

async function safeFetchPlace(placeId: string) {
  try {
    return await getPlaceById.execute(placeId);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const list = await resolveList(id);
    if (!list) return {};

    // Fetch first place photo for og:image
    let firstPhotoUrl: string | null = null;
    try {
      const listPlacesResult = await getListPlaces.execute(list.id);
      if (listPlacesResult.length > 0) {
        const firstPlace = await safeFetchPlace(listPlacesResult[0].placeId);
        firstPhotoUrl = firstPlace?.logoUrl ?? null;
      }
    } catch {
      // non-critical
    }

    return buildListMetadata(list, firstPhotoUrl);
  } catch {
    return {};
  }
}

export default async function ListDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Determine if `id` is a UUID or a slug
  const rawList = await resolveList(id);
  if (!rawList) notFound();

  const list = rawList;

  // If accessed by UUID and has a slug, redirect to slug URL
  if (UUID_REGEX.test(id) && list.slug) {
    permanentRedirect(`/lists/${list.slug}`);
  }

  // Só exibe lista privada ao dono
  const isOwner = !!user && user.id === list.ownerId;
  if (!list.isPublic && !isOwner) notFound();

  // Busca lugares — use list.id (canonical UUID)
  const listPlaces = await getListPlaces.execute(list.id);

  // isSavedByUser and incrementViewCount are not exposed as use cases — use repo directly
  const adminClient = createAdminClient();
  const listRepo = new SupabaseListRepository(adminClient);

  const [places, isSaved] = await Promise.all([
    Promise.all(listPlaces.map((lp) => safeFetchPlace(lp.placeId))),
    user ? listRepo.isSavedByUser(user.id, list.id) : Promise.resolve(false),
  ]);

  const validPlaces = places.filter((p) => p !== null);

  // Incrementa view count de forma assíncrona (fire and forget — não bloqueia o render)
  void listRepo.incrementViewCount(list.id);

  // Busca nome do dono (perfil)
  let ownerName = 'usuário';
  try {
    const { data: profile } = await adminClient
      .from('profiles')
      .select('name, nickname')
      .eq('id', list.ownerId)
      .single();
    ownerName = profile?.name ?? profile?.nickname ?? 'usuário';
  } catch {
    // silenciar — nome do dono não é crítico
  }

  return (
    <div>
      <PageTitle title={list.name} />
      <ListDetailHeader
        coverUrl={list.coverUrl}
        name={list.name}
        listId={list.id}
        isOwner={isOwner}
        isLoggedIn={!!user}
        initialSaved={isSaved}
        initialSavesCount={list.savesCount}
        places={validPlaces}
      />

      <div
        className="relative -mt-5 rounded-t-lg bg-bg-card shadow-(--shadow-card)"
        style={{ zIndex: 'var(--z-base)' }}
      >
        <ListStatsBarWrapper
          listId={list.id}
          placesCount={validPlaces.length}
          viewCount={list.viewCount}
          initialSavesCount={list.savesCount}
          initialSaved={isSaved}
        />
      </div>

      <PageContent>
        {/* Título + botão editar (só dono) */}
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold text-text-primary leading-tight">{list.name}</h1>
          {isOwner && (
            <Link
              href={`/lists/${list.id}/edit`}
              className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs text-text-secondary hover:bg-bg-subtle"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Link>
          )}
        </div>

        {/* Metadados */}
        <ListMetadata
          isPublic={list.isPublic}
          createdAt={list.createdAt}
          ownerName={ownerName}
          isOwner={isOwner}
        />

        {/* Descrição expansível */}
        {list.description && (
          <div className="mt-3">
            <ExpandableText text={list.description} maxLines={2} />
          </div>
        )}

        {/* Lista de lugares */}
        <ListPlacesSection places={validPlaces} isOwner={isOwner} listId={list.id} />
      </PageContent>
    </div>
  );
}
