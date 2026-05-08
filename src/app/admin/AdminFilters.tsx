'use client';

import { useState } from 'react';
import type { Place } from '@/domain/entities/Place';

interface AdminFiltersProps {
  places: Place[];
  onFiltersChange: (filtered: Place[]) => void;
}

export function AdminFilters({ places, onFiltersChange }: AdminFiltersProps) {
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState<'recent' | 'oldest'>('recent');

  const cities = [...new Set(places.map((p) => p.cidade))].sort();
  const types = [...new Set(places.map((p) => p.establishmentType))].sort();

  const applyFilters = (cityFilter: string, typeFilter: string, sortBy: 'recent' | 'oldest') => {
    let filtered = [...places];

    if (cityFilter) {
      filtered = filtered.filter((p) => p.cidade === cityFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter((p) => p.establishmentType === typeFilter);
    }

    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    onFiltersChange(filtered);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setCity(newCity);
    applyFilters(newCity, type, sort);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setType(newType);
    applyFilters(city, newType, sort);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as 'recent' | 'oldest';
    setSort(newSort);
    applyFilters(city, type, newSort);
  };

  return (
    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg bg-bg-subtle p-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="city-filter"
          className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          Cidade
        </label>
        <select
          id="city-filter"
          value={city}
          onChange={handleCityChange}
          className="min-w-[140px] rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary transition-colors hover:border-brand focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
        >
          <option value="">Todas</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="type-filter"
          className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          Tipo de Estabelecimento
        </label>
        <select
          id="type-filter"
          value={type}
          onChange={handleTypeChange}
          className="min-w-[140px] rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary transition-colors hover:border-brand focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
        >
          <option value="">Todos</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="sort-filter"
          className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          Ordenar
        </label>
        <select
          id="sort-filter"
          value={sort}
          onChange={handleSortChange}
          className="min-w-[140px] rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary transition-colors hover:border-brand focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
        >
          <option value="recent">Mais recentes</option>
          <option value="oldest">Mais antigos</option>
        </select>
      </div>
    </div>
  );
}
