import { notFound } from 'next/navigation';
import { getEditWithVotes, getPlaceById } from '@/presentation/lib/container';
import { PageContent } from '@/presentation/components/ui';
import { PageTitle } from '@/presentation/contexts/TopBarContext';
import { EditVotePanel } from '@/presentation/components/place/EditVotePanel';
import { createServerSupabaseClient } from '@/presentation/lib/api-helpers';

interface Props {
  params: Promise<{ id: string; editId: string }>;
}

export default async function EditVotePage({ params }: Props) {
  const { id: placeId, editId } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [edit, place] = await Promise.allSettled([
    getEditWithVotes.execute({ editId, viewerUserId: user?.id }),
    getPlaceById.execute(placeId),
  ]);

  if (edit.status === 'rejected' || !edit.value) {
    notFound();
  }

  if (place.status === 'rejected' || !place.value) {
    notFound();
  }

  const resolvedEdit = edit.value;
  const resolvedPlace = place.value;

  // Security: ensure edit belongs to this place
  if (resolvedEdit.placeId !== placeId) {
    notFound();
  }

  return (
    <>
      <PageTitle title="Verificar sugestão" />
      <PageContent>
        <EditVotePanel
          edit={resolvedEdit}
          placeId={placeId}
          placeName={resolvedPlace.name}
          placeAddress={resolvedPlace.address ?? ''}
          currentUserId={user?.id}
        />
      </PageContent>
    </>
  );
}
