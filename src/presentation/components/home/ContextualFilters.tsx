'use client';

import { Toggle } from '@/presentation/components/ui';
import type { EstablishmentTypeFilter } from './TypeSelector';
import {
  SERVICE_TYPES,
  FOOD_TAGS,
  BAR_FOCUS_OPTIONS,
  DRINK_TAGS,
  SPECIALTY_TAGS,
} from '@/presentation/lib/place-attributes';

export interface ContextualFilterValues {
  serviceType?: string;
  foodTag?: string;
  barFocus?: string;
  drinkTag?: string;
  hasHappyHour?: boolean;
  specialtyTag?: string;
  opensEarly?: boolean;
}

interface ContextualFiltersProps {
  establishmentType: EstablishmentTypeFilter | null;
  values: ContextualFilterValues;
  onChange: (values: ContextualFilterValues) => void;
}

function FilterPillGroup({
  options,
  selected,
  onSelect,
}: {
  options: readonly string[];
  selected?: string;
  onSelect: (value: string | undefined) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      {options.map((opt) => {
        const isActive = selected === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(isActive ? undefined : opt)}
            style={{
              height: '34px',
              padding: '0 0.875rem',
              borderRadius: 'var(--radius-full)',
              border: isActive
                ? '1.5px solid var(--color-brand)'
                : '1.5px solid var(--color-border)',
              background: isActive ? 'var(--color-brand)' : 'var(--color-bg)',
              color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
              fontSize: 'var(--font-size-label)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              transition: 'border-color 0.15s, background 0.15s, color 0.15s',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function FilterGroupLabel({ children }: { children: string }) {
  return (
    <p
      style={{
        fontSize: 'var(--font-size-caption)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '0.625rem',
      }}
    >
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <p
      style={{
        fontSize: 'var(--font-size-label)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-brand)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        marginTop: '1.25rem',
        marginBottom: '0.25rem',
      }}
    >
      {children}
    </p>
  );
}

function ToggleFilterRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.625rem 0',
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-text-primary)',
        }}
      >
        {label}
      </span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function FilterGroup({ children }: { children: React.ReactNode }) {
  return <div style={{ marginTop: '1.25rem' }}>{children}</div>;
}

export function ContextualFilters({ establishmentType, values, onChange }: ContextualFiltersProps) {
  const isVisible = establishmentType !== null;

  return (
    <div
      aria-hidden={!isVisible}
      style={{
        overflow: 'hidden',
        maxHeight: isVisible ? '800px' : '0',
        opacity: isVisible ? 1 : 0,
        transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
      }}
    >
      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: 'var(--color-border)',
          marginTop: '1.25rem',
        }}
      />

      {/* Restaurante */}
      {establishmentType === 'restaurante' && (
        <>
          <SectionTitle>Restaurante</SectionTitle>

          <FilterGroup>
            <FilterGroupLabel>Tipo de serviço</FilterGroupLabel>
            <FilterPillGroup
              options={SERVICE_TYPES}
              selected={values.serviceType}
              onSelect={(v) => onChange({ ...values, serviceType: v })}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterGroupLabel>Tipo de comida</FilterGroupLabel>
            <FilterPillGroup
              options={FOOD_TAGS}
              selected={values.foodTag}
              onSelect={(v) => onChange({ ...values, foodTag: v })}
            />
          </FilterGroup>
        </>
      )}

      {/* Bar / Boteco */}
      {establishmentType === 'bar' && (
        <>
          <SectionTitle>Bar / Boteco</SectionTitle>

          <FilterGroup>
            <FilterGroupLabel>Foco do bar</FilterGroupLabel>
            <FilterPillGroup
              options={BAR_FOCUS_OPTIONS}
              selected={values.barFocus}
              onSelect={(v) => onChange({ ...values, barFocus: v })}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterGroupLabel>Bebidas</FilterGroupLabel>
            <FilterPillGroup
              options={DRINK_TAGS}
              selected={values.drinkTag}
              onSelect={(v) => onChange({ ...values, drinkTag: v })}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterGroupLabel>Extras</FilterGroupLabel>
            <ToggleFilterRow
              label="Tem happy hour"
              checked={values.hasHappyHour ?? false}
              onChange={(v) => onChange({ ...values, hasHappyHour: v })}
            />
          </FilterGroup>
        </>
      )}

      {/* Padaria */}
      {establishmentType === 'padaria' && (
        <>
          <SectionTitle>Padaria</SectionTitle>

          <FilterGroup>
            <FilterGroupLabel>Especialidade</FilterGroupLabel>
            <FilterPillGroup
              options={SPECIALTY_TAGS}
              selected={values.specialtyTag}
              onSelect={(v) => onChange({ ...values, specialtyTag: v })}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterGroupLabel>Horário</FilterGroupLabel>
            <ToggleFilterRow
              label="Abre antes das 8h"
              checked={values.opensEarly ?? false}
              onChange={(v) => onChange({ ...values, opensEarly: v })}
            />
          </FilterGroup>
        </>
      )}
    </div>
  );
}
