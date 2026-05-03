'use client';

import { useState } from 'react';
import { Button, Input } from '@/presentation/components/ui';

interface LocationSearchProps {
  onLocation: (lat: number, lng: number, label: string) => void;
  onRetry: () => void;
  retrying?: boolean;
}

export function LocationSearch({ onLocation, onRetry, retrying }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Cidade não encontrada. Tente com o estado: "São Paulo, SP"');

      const data = (await res.json()) as { lat: number; lng: number; displayName: string };
      onLocation(data.lat, data.lng, data.displayName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar localização');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-4 mt-4 rounded-lg border border-border bg-bg p-4 shadow-(--shadow-card)">
      <div className="mb-3 flex items-start gap-3">
        <span className="text-2xl">📍</span>
        <div>
          <p className="text-sm font-medium text-text-primary">Localização não disponível</p>
          <p className="text-xs text-text-secondary mt-0.5">
            Permissão negada ou navegador sem suporte.
          </p>
        </div>
      </div>

      <form onSubmit={search} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            placeholder="Ex: Vila Madalena, SP"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading} size="md">
            {loading ? '…' : 'Buscar'}
          </Button>
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </form>

      <button
        onClick={onRetry}
        disabled={retrying}
        className="mt-3 text-xs text-brand hover:underline disabled:opacity-50"
      >
        {retrying ? 'Solicitando...' : 'Tentar usar GPS novamente'}
      </button>
    </div>
  );
}
