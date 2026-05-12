'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Shield, Check } from 'lucide-react';
import type { AutocompleteResult } from '@/domain/interfaces/IMapProvider';
import { Button } from '@/presentation/components/ui/Button';
import { Sheet } from '@/presentation/components/ui/Sheet';
import { Textarea } from '@/presentation/components/ui/Textarea';
import { useProposeEdit } from '@/presentation/hooks/useProposeEdit';
import { formatEditValue } from '@/presentation/lib/editFieldFormatters';
import { EDIT_FIELD_LABELS } from '@/presentation/lib/editFieldLabels';
import {
  FOOD_TAGS,
  DRINK_TAGS,
  SPECIALTY_TAGS,
  FOOD_TAG_MAX,
  DRINK_TAG_MAX,
  SPECIALTY_TAG_MAX,
} from '@/presentation/lib/editFieldOptions';
import {
  ScalarTextControl,
  PriceBucketControl,
  PaymentMethodsControl,
  PeriodsControl,
  BooleanToggleControl,
  ServiceTypeControl,
  BarFocusControl,
  TagsControl,
  LocationControl,
} from './edit-field-controls';

// ——————————————————————————————————————————
// Types
// ——————————————————————————————————————————

export interface SuggestEditSheetProps {
  open: boolean;
  onClose: () => void;
  place: {
    id: string;
    name: string;
    address: string;
    numero?: string;
    bairro?: string;
    cidade: string;
    estado: string;
    establishmentType: string;
    priceBucket?: string;
    description?: string;
    attributes: Record<string, string[]>;
    periods: string[];
  };
  pendingEditsByField: Record<string, { id: string }>;
  placeId: string;
}

type SheetView = 'select' | 'editing' | 'success' | 'rate_limited' | 'error';

// ——————————————————————————————————————————
// Field config
// ——————————————————————————————————————————

const UNIVERSAL_FIELDS = ['price_bucket', 'description', 'payment_methods', 'periods'];

const TYPE_FIELDS: Record<string, string[]> = {
  restaurante: ['service_type', 'food_tags'],
  bar: ['bar_focus', 'drink_tags', 'has_happy_hour'],
  padaria: ['specialty_tags', 'opens_early'],
  lanchonete: ['service_type', 'food_tags'],
  doceria: ['specialty_tags'],
  food_truck: ['food_tags'],
  mercado: ['specialty_tags'],
};

const LEVEL_2_FIELDS = ['name', 'location'];

const FIELD_ICONS: Record<string, string> = {
  name: '✏️',
  location: '📍',
  price_bucket: '💰',
  description: '📝',
  payment_methods: '💳',
  periods: '🕐',
  service_type: '🛵',
  food_tags: '🏷️',
  bar_focus: '🍺',
  drink_tags: '🍺',
  has_happy_hour: '🎉',
  specialty_tags: '🏷️',
  opens_early: '🌅',
};

// ——————————————————————————————————————————
// Helpers
// ——————————————————————————————————————————

function getCurrentValue(fieldName: string, place: SuggestEditSheetProps['place']): unknown {
  switch (fieldName) {
    case 'name':
      return place.name;
    case 'location':
      return [
        place.address,
        place.numero ? `, ${place.numero}` : '',
        place.bairro ? ` · ${place.bairro}` : '',
        ` · ${place.cidade}, ${place.estado}`,
      ].join('');
    case 'price_bucket':
      return place.priceBucket ?? '';
    case 'description':
      return place.description ?? '';
    case 'payment_methods':
      return place.attributes['payment_methods'] ?? [];
    case 'periods':
      return place.periods;
    case 'service_type':
      return place.attributes['service_type']?.[0] ?? '';
    case 'food_tags':
      return place.attributes['food_tags'] ?? [];
    case 'bar_focus':
      return place.attributes['bar_focus']?.[0] ?? '';
    case 'drink_tags':
      return place.attributes['drink_tags'] ?? [];
    case 'has_happy_hour':
      return place.attributes['has_happy_hour']?.[0] === 'true';
    case 'specialty_tags':
      return place.attributes['specialty_tags'] ?? [];
    case 'opens_early':
      return place.attributes['opens_early']?.[0] === 'true';
    default:
      return '';
  }
}

function getInitialProposedValue(fieldName: string, currentValue: unknown): unknown {
  // Start proposed value equal to current so user can modify from known state
  switch (fieldName) {
    case 'payment_methods':
    case 'food_tags':
    case 'drink_tags':
    case 'specialty_tags':
    case 'periods':
      return Array.isArray(currentValue) ? [...(currentValue as string[])] : [];
    case 'has_happy_hour':
    case 'opens_early':
      return typeof currentValue === 'boolean' ? currentValue : false;
    case 'location':
      return null;
    default:
      return typeof currentValue === 'string' ? currentValue : '';
  }
}

function hasValueChanged(fieldName: string, current: unknown, proposed: unknown): boolean {
  if (proposed === null || proposed === undefined) return false;
  switch (fieldName) {
    case 'payment_methods':
    case 'food_tags':
    case 'drink_tags':
    case 'specialty_tags':
    case 'periods': {
      const a = JSON.stringify([...(current as string[])].sort());
      const b = JSON.stringify([...(proposed as string[])].sort());
      return a !== b;
    }
    case 'location':
      return proposed !== null;
    default:
      return String(proposed).trim() !== String(current).trim();
  }
}

function serializeValue(fieldName: string, proposed: unknown): unknown {
  switch (fieldName) {
    case 'location': {
      const loc = proposed as AutocompleteResult;
      return { address: loc.displayName, lat: loc.lat, lng: loc.lng };
    }
    case 'has_happy_hour':
    case 'opens_early':
      return String(proposed);
    default:
      return proposed;
  }
}

// ——————————————————————————————————————————
// Field control renderer
// ——————————————————————————————————————————

interface FieldControlProps {
  fieldName: string;
  place: SuggestEditSheetProps['place'];
  proposedValue: unknown;
  onChangeProposed: (v: unknown) => void;
}

function FieldControl({ fieldName, place, proposedValue, onChangeProposed }: FieldControlProps) {
  const current = getCurrentValue(fieldName, place);

  switch (fieldName) {
    case 'name':
      return (
        <ScalarTextControl
          currentValue={String(current)}
          value={String(proposedValue ?? '')}
          onChange={(v) => onChangeProposed(v)}
          maxLength={100}
        />
      );
    case 'description':
      return (
        <ScalarTextControl
          currentValue={String(current)}
          value={String(proposedValue ?? '')}
          onChange={(v) => onChangeProposed(v)}
          multiline
          maxLength={300}
        />
      );
    case 'price_bucket':
      return (
        <PriceBucketControl
          currentValue={String(current)}
          value={String(proposedValue ?? '')}
          onChange={(v) => onChangeProposed(v)}
        />
      );
    case 'payment_methods':
      return (
        <PaymentMethodsControl
          currentValue={current as string[]}
          value={proposedValue as string[]}
          onChange={(v) => onChangeProposed(v)}
        />
      );
    case 'periods':
      return (
        <PeriodsControl
          currentValue={current as string[]}
          value={proposedValue as string[]}
          onChange={(v) => onChangeProposed(v)}
        />
      );
    case 'service_type':
      return (
        <ServiceTypeControl
          currentValue={String(current)}
          value={String(proposedValue ?? '')}
          onChange={(v) => onChangeProposed(v)}
        />
      );
    case 'bar_focus':
      return (
        <BarFocusControl
          currentValue={String(current)}
          value={String(proposedValue ?? '')}
          onChange={(v) => onChangeProposed(v)}
        />
      );
    case 'food_tags':
      return (
        <TagsControl
          options={FOOD_TAGS}
          maxSelected={FOOD_TAG_MAX}
          currentValue={current as string[]}
          value={proposedValue as string[]}
          onChange={(v) => onChangeProposed(v)}
        />
      );
    case 'drink_tags':
      return (
        <TagsControl
          options={DRINK_TAGS}
          maxSelected={DRINK_TAG_MAX}
          currentValue={current as string[]}
          value={proposedValue as string[]}
          onChange={(v) => onChangeProposed(v)}
        />
      );
    case 'specialty_tags':
      return (
        <TagsControl
          options={SPECIALTY_TAGS}
          maxSelected={SPECIALTY_TAG_MAX}
          currentValue={current as string[]}
          value={proposedValue as string[]}
          onChange={(v) => onChangeProposed(v)}
        />
      );
    case 'has_happy_hour':
      return (
        <BooleanToggleControl
          label="Tem happy hour"
          currentValue={current as boolean}
          value={proposedValue as boolean}
          onChange={(v) => onChangeProposed(v)}
        />
      );
    case 'opens_early':
      return (
        <BooleanToggleControl
          label="Abre cedo (antes das 8h)"
          currentValue={current as boolean}
          value={proposedValue as boolean}
          onChange={(v) => onChangeProposed(v)}
        />
      );
    case 'location':
      return (
        <LocationControl
          currentValue={String(current)}
          value={proposedValue as AutocompleteResult | null}
          onChange={(v) => onChangeProposed(v)}
        />
      );
    default:
      return null;
  }
}

// ——————————————————————————————————————————
// Main component
// ——————————————————————————————————————————

export function SuggestEditSheet({
  open,
  onClose,
  place,
  pendingEditsByField,
  placeId,
}: SuggestEditSheetProps) {
  const router = useRouter();
  const { propose, state, reset } = useProposeEdit();

  const [view, setView] = useState<SheetView>('select');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [proposedValue, setProposedValue] = useState<unknown>(null);
  const [note, setNote] = useState('');

  const typeSpecific = TYPE_FIELDS[place.establishmentType] ?? [];
  const level1Fields = [...UNIVERSAL_FIELDS, ...typeSpecific];

  // Reset when sheet opens
  useEffect(() => {
    if (open) {
      setView('select');
      setSelectedField(null);
      setProposedValue(null);
      setNote('');
      reset();
    }
    // reset is stable; open is the real trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // React to propose result
  useEffect(() => {
    if (state.status === 'success') {
      setView('success');
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
    if (state.status === 'rate_limited') setView('rate_limited');
    if (state.status === 'conflict') router.push(`/places/${placeId}/edits/${state.editId}`);
    if (state.status === 'error') setView('error');
    // onClose, router, placeId are stable references; state is the real trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleSelectField = useCallback(
    (fieldName: string) => {
      setSelectedField(fieldName);
      const current = getCurrentValue(fieldName, place);
      setProposedValue(getInitialProposedValue(fieldName, current));
      setNote('');
      setView('editing');
    },
    [place],
  );

  const handleBack = () => {
    setView('select');
    setSelectedField(null);
    setProposedValue(null);
    setNote('');
  };

  const handleVote = useCallback(
    (editId: string) => {
      router.push(`/places/${placeId}/edits/${editId}`);
    },
    [router, placeId],
  );

  const handleSubmit = async () => {
    if (!selectedField) return;
    await propose({
      placeId,
      fieldName: selectedField,
      newValue: serializeValue(selectedField, proposedValue),
      note: note.trim() || undefined,
    });
  };

  const canSubmit =
    view === 'editing' &&
    selectedField !== null &&
    hasValueChanged(selectedField, getCurrentValue(selectedField, place), proposedValue);

  const sheetHeader = (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">
      {view === 'editing' ? (
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-brand)' }}
        >
          ← Voltar
        </button>
      ) : (
        <span
          className="font-bold tracking-tight"
          style={{ fontSize: 'var(--font-size-heading)', color: 'var(--color-text-primary)' }}
        >
          Sugerir correção
        </span>
      )}
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-subtle transition-opacity hover:opacity-70"
        aria-label="Fechar"
      >
        <X size={16} style={{ color: 'var(--color-text-secondary)' }} />
      </button>
    </div>
  );

  const sheetFooter =
    view === 'select' || view === 'editing' || view === 'error' ? (
      <div className="border-t border-border px-5 pb-6 pt-3">
        {view === 'error' ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => {
              reset();
              setView('editing');
            }}
          >
            Tentar novamente
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!canSubmit || state.status === 'loading'}
            onClick={() => void handleSubmit()}
          >
            {state.status === 'loading' ? 'Enviando...' : 'Enviar sugestão'}
          </Button>
        )}
      </div>
    ) : undefined;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      ariaLabel="Sugerir correção"
      header={sheetHeader}
      footer={sheetFooter}
    >
      {/* ——— SELECT VIEW ——— */}
      {view === 'select' && (
        <>
          <FieldSection
            label="Informações básicas"
            fields={level1Fields}
            place={place}
            pendingEditsByField={pendingEditsByField}
            onSelect={handleSelectField}
            onVote={handleVote}
          />
          <FieldSection
            label="Dados principais"
            showLevel2Badge
            fields={LEVEL_2_FIELDS}
            place={place}
            pendingEditsByField={pendingEditsByField}
            onSelect={handleSelectField}
            onVote={handleVote}
          />
        </>
      )}

      {/* ——— EDITING VIEW ——— */}
      {view === 'editing' && selectedField && (
        <div className="flex flex-col gap-4">
          <div>
            <p
              className="mb-1 font-semibold uppercase tracking-wider"
              style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-brand)' }}
            >
              Novo valor
            </p>
            <FieldControl
              fieldName={selectedField}
              place={place}
              proposedValue={proposedValue}
              onChangeProposed={setProposedValue}
            />
          </div>
          <div className="border-t border-border pt-3">
            <div className="mb-1.5 flex items-center gap-1">
              <span className="text-sm text-text-secondary">Contexto</span>
              <span
                style={{
                  fontSize: 'var(--font-size-caption)',
                  color: 'var(--color-text-disabled)',
                }}
              >
                – opcional · máx 280
              </span>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={280}
              rows={2}
              placeholder="Ex: fui hoje e o VR não foi aceito"
            />
            <p
              className="mt-1 text-right"
              style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}
            >
              {note.length}/280
            </p>
          </div>
        </div>
      )}

      {/* ——— SUCCESS VIEW ——— */}
      {view === 'success' && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--color-success-bg)' }}
          >
            <Check size={28} style={{ color: 'var(--color-success)' }} strokeWidth={2.5} />
          </div>
          <p
            className="mb-1.5 font-bold"
            style={{ fontSize: 'var(--font-size-heading)', color: 'var(--color-text-primary)' }}
          >
            Sugestão enviada!
          </p>
          <p
            className="leading-relaxed"
            style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)' }}
          >
            Obrigado pela contribuição. A comunidade vai verificar e o campo vai ser atualizado se
            confirmado.
          </p>
        </div>
      )}

      {/* ——— RATE LIMITED VIEW ——— */}
      {view === 'rate_limited' && state.status === 'rate_limited' && (
        <div
          className="rounded-md border px-4 py-3"
          style={{
            backgroundColor: 'var(--color-warning-bg)',
            borderColor: 'var(--color-warning-border)',
          }}
        >
          <p
            className="mb-1 font-semibold"
            style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-warning-text)' }}
          >
            Limite de sugestões atingido
          </p>
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-warning)' }}>
            {state.message}
          </p>
        </div>
      )}

      {/* ——— ERROR VIEW ——— */}
      {view === 'error' && state.status === 'error' && (
        <div
          className="rounded-md border px-4 py-3"
          style={{
            backgroundColor: 'var(--color-error-bg)',
            borderColor: 'var(--color-error-border)',
          }}
        >
          <p
            className="mb-1 font-semibold"
            style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-error)' }}
          >
            Erro ao enviar
          </p>
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-error)' }}>
            {state.message}
          </p>
        </div>
      )}
    </Sheet>
  );
}

// ——————————————————————————————————————————
// Field section sub-component
// ——————————————————————————————————————————

interface FieldSectionProps {
  label: string;
  showLevel2Badge?: boolean;
  fields: string[];
  place: SuggestEditSheetProps['place'];
  pendingEditsByField: Record<string, { id: string }>;
  onSelect: (fieldName: string) => void;
  onVote: (editId: string) => void;
}

function FieldSection({
  label,
  showLevel2Badge = false,
  fields,
  place,
  pendingEditsByField,
  onSelect,
  onVote,
}: FieldSectionProps) {
  return (
    <div className="mb-2">
      <div className="mb-2 mt-4 flex items-center gap-2 first:mt-0">
        <span
          className="uppercase tracking-wider"
          style={{
            fontSize: 'var(--font-size-caption)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}
        >
          {label}
        </span>
        {showLevel2Badge && (
          <span
            className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5"
            style={{
              fontSize: 'var(--font-size-caption)',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-bg-subtle)',
              borderColor: 'var(--color-border)',
            }}
          >
            <Shield size={10} />
            Requer mais votos
          </span>
        )}
      </div>

      {fields.map((fieldName) => {
        const pending = pendingEditsByField[fieldName];
        const currentValue = getCurrentValue(fieldName, place);
        const formattedCurrent = formatEditValue(fieldName, currentValue);
        const icon = FIELD_ICONS[fieldName] ?? '📋';
        const fieldLabel = EDIT_FIELD_LABELS[fieldName] ?? fieldName;

        return (
          <FieldOptionRow
            key={fieldName}
            icon={icon}
            label={fieldLabel}
            currentFormatted={formattedCurrent}
            hasPending={!!pending}
            pendingEditId={pending?.id}
            onSelect={() => onSelect(fieldName)}
            onVote={onVote}
          />
        );
      })}
    </div>
  );
}

// ——————————————————————————————————————————
// Field option row
// ——————————————————————————————————————————

interface FieldOptionRowProps {
  icon: string;
  label: string;
  currentFormatted: string;
  hasPending: boolean;
  pendingEditId?: string;
  onSelect: () => void;
  onVote: (editId: string) => void;
}

function FieldOptionRow({
  icon,
  label,
  currentFormatted,
  hasPending,
  pendingEditId,
  onSelect,
  onVote,
}: FieldOptionRowProps) {
  return (
    <div
      className={`mb-2 flex items-center gap-3 rounded-md border px-3.5 py-3 transition-colors hover:bg-bg-subtle ${hasPending ? 'cursor-default' : 'cursor-pointer'}`}
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
      onClick={hasPending ? undefined : onSelect}
      role={hasPending ? undefined : 'button'}
    >
      <span className="shrink-0 text-lg">{icon}</span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">{label}</p>
        <p
          className="truncate"
          style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)' }}
        >
          {currentFormatted}
        </p>
      </div>

      <div className="shrink-0">
        {hasPending ? (
          <div className="flex flex-col items-end gap-1">
            <span
              className="rounded-full border px-2 py-0.5"
              style={{
                fontSize: 'var(--font-size-caption)',
                fontWeight: 600,
                color: 'var(--color-verify-text)',
                backgroundColor: 'var(--color-verify-bg)',
                borderColor: 'var(--color-verify-border)',
                whiteSpace: 'nowrap',
              }}
            >
              em análise
            </span>
            {pendingEditId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(pendingEditId);
                }}
                className="text-left underline underline-offset-2 transition-opacity hover:opacity-70"
                style={{
                  fontSize: 'var(--font-size-label)',
                  fontWeight: 500,
                  color: 'var(--color-brand)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                votar
              </button>
            )}
          </div>
        ) : (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full border-2"
            style={{ borderColor: 'var(--color-border)' }}
          />
        )}
      </div>
    </div>
  );
}
