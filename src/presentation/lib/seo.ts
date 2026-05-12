import type { Metadata } from 'next';
import type { Place } from '@/domain/entities/Place';
import type { UserList } from '@/domain/entities/List';

export function buildPlaceMetadata(place: Place): Metadata {
  const title = `${place.name} — ${place.bairro ? `${place.bairro}, ` : ''}${place.cidade} | Podrao`;
  const description = `Veja avaliações de ${place.name} no Podrao`;

  const images = place.logoUrl ? [{ url: place.logoUrl }] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: place.logoUrl ? [place.logoUrl] : [],
    },
  };
}

export function buildListMetadata(list: UserList, firstPhotoUrl: string | null): Metadata {
  const title = `${list.name} — Listas de comida no Podrao`;
  const description = list.description ?? `Confira a lista ${list.name} no Podrao`;

  const images = firstPhotoUrl ? [{ url: firstPhotoUrl }] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: firstPhotoUrl ? [firstPhotoUrl] : [],
    },
  };
}
