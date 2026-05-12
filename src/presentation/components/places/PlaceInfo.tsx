import Image from 'next/image';
import { ThumbsUp, UtensilsCrossed } from 'lucide-react';
import {
  ESTABLISHMENT_TYPE_META,
  type EstablishmentType,
} from '@/domain/value-objects/EstablishmentType';
import type { PlaceStatus } from '@/domain/entities/Place';
import { PlaceRating, ExpandableText } from '@/presentation/components/ui';
import { EditablePlaceLogo } from './EditablePlaceLogo';

interface PlaceInfoProps {
  name: string;
  status: PlaceStatus;
  address: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  establishmentType: string;
  reviewsCount: number;
  rating: number;
  description?: string;
  recommendPct?: number;
  logoUrl?: string;
  isOwner?: boolean;
  placeId?: string;
}

export function PlaceInfo({
  name,
  address,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  establishmentType,
  reviewsCount,
  rating,
  description,
  recommendPct,
  logoUrl,
  isOwner,
  placeId,
}: PlaceInfoProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Linha 1: nome + endereço (esquerda) | logo (direita) */}
      <div className="flex items-start justify-between gap-4">
        {isOwner && placeId ? (
          <EditablePlaceLogo placeId={placeId} logoUrl={logoUrl} name={name} />
        ) : (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border">
            {logoUrl ? (
              <Image src={logoUrl} alt={name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand-subtle">
                <UtensilsCrossed className="h-7 w-7 text-brand" fill="currentColor" />
              </div>
            )}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold leading-tight text-text-primary">{name}</h1>
          <p className="mt-0.5 text-sm leading-snug text-text-secondary">
            {address}
            {numero && `, ${numero}`}
            {complemento && ` - ${complemento}`}
            {bairro && ` · ${bairro}`} · {cidade}, {estado}
          </p>
        </div>
      </div>

      {/* Linha 2: tipo · PlaceRating | ◆ recomendam */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-secondary">
        <span>
          {ESTABLISHMENT_TYPE_META[establishmentType as EstablishmentType]?.label ??
            establishmentType}
        </span>

        {reviewsCount > 0 && (
          <>
            <span className="h-0.5 w-0.5 rounded-full bg-text-disabled" />
            <PlaceRating rating={rating} reviewsCount={reviewsCount} showLabel />
            {recommendPct !== undefined && (
              <>
                <span className="text-text-disabled">|</span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3 text-success" fill="currentColor" />
                  {recommendPct}% recomendam
                </span>
              </>
            )}
          </>
        )}
      </div>

      {description && (
        <div className="border-t border-border pt-3">
          <ExpandableText text={description} maxLines={2} />
        </div>
      )}
    </div>
  );
}
