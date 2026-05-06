import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/presentation/lib/api-helpers';
import { SupabasePlaceRepository } from '@/infrastructure/database/supabase/SupabasePlaceRepository';
import { SupabaseListRepository } from '@/infrastructure/database/supabase/SupabaseListRepository';
import { createAdminClient } from '@/infrastructure/database/supabase/client';
import { ListDetailHeader } from '@/presentation/components/lists/ListDetailHeader';
import { ListMetadata } from '@/presentation/components/lists/ListMetadata';
import { ListPlacesSection } from '@/presentation/components/lists/ListPlacesSection';
import { ListStatsBarWrapper } from '@/presentation/components/lists/ListStatsBarWrapper';
import { ExpandableText } from '@/presentation/components/ui/ExpandableText';
import { PageContent } from '@/presentation/components/ui/PageContent';
import { PageTitle } from '@/presentation/contexts/TopBarContext';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();
  const listRepo = new SupabaseListRepository(adminClient);
  const placeRepo = new SupabasePlaceRepository(adminClient);

  const list = await listRepo.findById(id);
  if (!list) notFound();

  // Só exibe lista privada ao dono
  const isOwner = !!user && user.id === list.ownerId;
  if (!list.isPublic && !isOwner) notFound();

  // Busca lugares e estados do usuário em paralelo
  const listPlaces = await listRepo.getPlaces(id);

  const [places, isSaved] = await Promise.all([
    Promise.all(listPlaces.map((lp) => placeRepo.findById(lp.placeId))),
    user ? listRepo.isSavedByUser(user.id, id) : Promise.resolve(false),
  ]);

  const validPlaces = places.filter((p) => p !== null);

  // Incrementa view count de forma assíncrona (fire and forget — não bloqueia o render)
  void listRepo.incrementViewCount(id);

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
        listId={id}
        isOwner={isOwner}
        isLoggedIn={!!user}
        initialSaved={isSaved}
        initialSavesCount={list.savesCount}
        places={validPlaces}
      />

      <div className="relative -mt-5 rounded-t-2xl bg-bg-card shadow-(--shadow-card) z-[1]">
        <ListStatsBarWrapper
          listId={id}
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
              href={`/lists/${id}/edit`}
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
        <ListPlacesSection places={validPlaces} isOwner={isOwner} listId={id} />
      </PageContent>
    </div>
  );
}
