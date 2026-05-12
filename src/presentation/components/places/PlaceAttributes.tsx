import type { ReactNode } from 'react';
import type { Place } from '@/domain/entities/Place';
import type { EstablishmentType } from '@/domain/value-objects/EstablishmentType';
import { OPERATING_PERIOD_META } from '@/domain/value-objects/OperatingPeriod';
import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import { Badge, ExpandableText } from '@/presentation/components/ui';
import { HighlightCard } from './HighlightCard';

/* ── Label maps — must match StepDetails* exactly ──────────────── */

const VR_METHODS = new Set(['VR', 'VA']);

const TAGS_SECTION_TITLE: Record<EstablishmentType, string> = {
  restaurante: 'Especialidades',
  bar: 'O que tem no copo',
  padaria: 'O que tem aqui',
};

/* ── Helper ─────────────────────────────────────────────────────── */

function getBoolAttr(attributes: Record<string, string[]>, key: string): boolean {
  return attributes[key]?.[0] === 'true';
}

/* ── Component ──────────────────────────────────────────────────── */

interface PlaceAttributesProps {
  place: Place;
  description?: string;
  pendingBanner?: ReactNode;
}

export function PlaceAttributes({ place, description, pendingBanner }: PlaceAttributesProps) {
  const { establishmentType, attributes, periods, priceBucket } = place;
  const type = establishmentType as EstablishmentType;

  /* service_type / bar_focus */
  const serviceType = attributes['service_type']?.[0];
  const barFocus = attributes['bar_focus']?.[0];
  const primaryLabel = type === 'bar' ? barFocus : serviceType;

  /* payment_methods */
  const paymentMethods: string[] = attributes['payment_methods'] ?? [];

  /* tags by type */
  const foodTags: string[] = attributes['food_tags'] ?? [];
  const drinkTags: string[] = attributes['drink_tags'] ?? [];
  const specialtyTags: string[] = attributes['specialty_tags'] ?? [];

  const allTags = type === 'bar' ? drinkTags : type === 'padaria' ? specialtyTags : foodTags;
  const tagsTitle = TAGS_SECTION_TITLE[type] ?? 'Especialidades';

  /* conditional highlights */
  const hasHappyHour = type === 'bar' && getBoolAttr(attributes, 'has_happy_hour');
  const opensEarly = type === 'padaria' && getBoolAttr(attributes, 'opens_early');
  const hasHighlights = hasHappyHour || opensEarly;

  const hasQuickAttrs = paymentMethods.length > 0 || periods.length > 0;

  return (
    <div className="flex flex-col">
      {/* ── Service type pill + price (identidade) ───────────── */}
      {(primaryLabel || priceBucket) && (
        <div className="flex flex-wrap items-center gap-2 pt-3">
          {primaryLabel && <Badge variant="brand">{primaryLabel}</Badge>}
          {priceBucket && <Badge variant="default">{PRICE_BUCKET_LABELS[priceBucket]}</Badge>}
        </div>
      )}

      {/* ── Quick attrs: pagamento + períodos ────────────────── */}
      {hasQuickAttrs && (
        <>
          <hr className="my-4 border-border" />
          <div className="flex flex-col gap-3">
            {/* Formas de pagamento */}
            {paymentMethods.length > 0 && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-subtle text-base">
                  💳
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {paymentMethods.map((method) =>
                    VR_METHODS.has(method) ? (
                      <span
                        key={method}
                        className="inline-flex items-center gap-1 rounded-full border border-vr-border bg-vr-bg px-2.5 py-0.5 text-[13px] font-semibold text-vr-text"
                      >
                        ✓ {method}
                      </span>
                    ) : (
                      <Badge key={method} variant="default">
                        {method}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Funciona (períodos) */}
            {periods.length > 0 && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-subtle text-base">
                  🕐
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {periods.map((p) => {
                    const meta = OPERATING_PERIOD_META[p];
                    return (
                      <Badge key={p} variant="brand">
                        {meta ? `${meta.emoji} ${meta.label}` : p}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Highlight cards (has_happy_hour / opens_early) ───── */}
      {hasHighlights && (
        <>
          <hr className="my-4 border-border" />
          <div className="flex flex-col gap-2">
            {hasHappyHour && (
              <HighlightCard
                icon="🍻"
                title="Tem happy hour"
                subtitle="Promoção especial no final da tarde"
              />
            )}
            {opensEarly && (
              <HighlightCard icon="🌅" title="Abre antes das 8h" subtitle="Bom para quem madruga" />
            )}
          </div>
        </>
      )}

      {/* ── Banner de edições pendentes ─────────────────────── */}
      {pendingBanner}

      {/* ── Tags (food / drink / specialty) ─────────────────── */}
      {allTags.length > 0 && (
        <>
          <hr className="my-4 border-border" />
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              {tagsTitle}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <Badge key={tag} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Descrição — "Sobre o lugar" ──────────────────────── */}
      {description && (
        <>
          <hr className="my-4 border-border" />
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Sobre o lugar
            </p>
            <ExpandableText text={description} maxLines={3} />
          </div>
        </>
      )}
    </div>
  );
}
