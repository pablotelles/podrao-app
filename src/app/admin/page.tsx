'use client';

import React, { useEffect, useState } from 'react';
import { Eye, XCircle, CheckCircle } from 'lucide-react';
import {
  Button,
  Badge,
  DataTable,
  EmptyState,
  Skeleton,
  Toast,
} from '@/presentation/components/ui';
import { AdminFilters } from './AdminFilters';
import { RejectModal } from './RejectModal';
import { usePendingPlaces } from '@/presentation/hooks/usePendingPlaces';
import type { PendingPlaceItem } from '@/domain/entities/PendingPlaceItem';

const PAGE_SIZE = 5;

interface ToastMessage {
  text: string;
  type: 'success' | 'error';
}

export default function AdminPage() {
  const { places, total, error, isLoading, refresh } = usePendingPlaces();

  const [filteredPlaces, setFilteredPlaces] = useState<PendingPlaceItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{ id: string; name: string } | null>(null);
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const [rejectingIds, setRejectingIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  // Sync filteredPlaces with real data after load
  useEffect(() => {
    if (!isLoading && !error) {
      setFilteredPlaces(places);
    }
  }, [places, isLoading, error]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const delay = toastMessage.type === 'success' ? 3000 : 5000;
    const timer = setTimeout(() => setToastMessage(null), delay);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const totalPages = Math.ceil(filteredPlaces.length / PAGE_SIZE);
  const paginatedPlaces = filteredPlaces.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleFiltersChange = (filtered: PendingPlaceItem[]) => {
    setFilteredPlaces(filtered);
    setCurrentPage(1);
  };

  const handleOpenRejectModal = (placeId: string, placeName: string) => {
    setSelectedPlace({ id: placeId, name: placeName });
    setIsRejectModalOpen(true);
  };

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
    setSelectedPlace(null);
  };

  const handleApprovePlace = async (placeId: string) => {
    setApprovingIds((prev) => new Set([...prev, placeId]));
    try {
      const res = await fetch(`/api/admin/places/${placeId}/approve`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as { error?: string }).error ?? 'Erro ao aprovar');
      }
      setFilteredPlaces((prev) => prev.filter((p) => p.id !== placeId));
      setToastMessage({ text: 'Lugar aprovado com sucesso', type: 'success' });
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao aprovar';
      setToastMessage({ text: `Erro ao aprovar: ${msg}`, type: 'error' });
    } finally {
      setApprovingIds((prev) => {
        const next = new Set(prev);
        next.delete(placeId);
        return next;
      });
    }
  };

  const handleConfirmReject = async (placeId: string, reason: string) => {
    setRejectingIds((prev) => new Set([...prev, placeId]));
    try {
      const res = await fetch(`/api/admin/places/${placeId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as { error?: string }).error ?? 'Erro ao rejeitar');
      }
      setFilteredPlaces((prev) => prev.filter((p) => p.id !== placeId));
      handleCloseRejectModal();
      setToastMessage({ text: 'Lugar rejeitado com sucesso', type: 'success' });
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao rejeitar';
      setToastMessage({ text: `Erro ao rejeitar: ${msg}`, type: 'error' });
    } finally {
      setRejectingIds((prev) => {
        const next = new Set(prev);
        next.delete(placeId);
        return next;
      });
    }
  };

  const handleViewPlace = (placeId: string) => {
    window.open(`/places/${placeId}`, '_blank', 'noopener,noreferrer');
  };

  // Loading state — skeleton rows
  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        title="Erro ao carregar lugares pendentes"
        description="Não foi possível carregar a lista. Tente recarregar a página."
        icon="⚠️"
      />
    );
  }

  return (
    <>
      <div>
        {filteredPlaces.length > 0 ? (
          <>
            {/* Header Section */}
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold text-text-primary">Aguardando Aprovação</h2>
              <Badge variant="warning">{total} lugares pendentes</Badge>
            </div>

            {/* Filters */}
            <AdminFilters places={places} onFiltersChange={handleFiltersChange} />

            {/* Table */}
            <DataTable<PendingPlaceItem>
              columns={[
                { label: 'Lugar', key: 'name', width: '240px' },
                { label: 'Tipo', key: 'type', width: '120px', align: 'center' },
                { label: 'Preço', key: 'price', width: '90px' },
                { label: 'Criador', key: 'creator', width: '140px' },
                { label: 'Status', key: 'status', width: '100px', align: 'center' },
                { label: 'Ações', key: 'actions', width: '110px', align: 'center' },
              ]}
              data={paginatedPlaces}
              pagination={{
                currentPage,
                totalPages,
                totalItems: filteredPlaces.length,
                pageSize: PAGE_SIZE,
                onPageChange: setCurrentPage,
              }}
              renderCell={(columnKey, value, row) => {
                const isRowBusy = approvingIds.has(row.id) || rejectingIds.has(row.id);
                switch (columnKey) {
                  case 'name':
                    return (
                      <div className="flex items-center gap-3">
                        {row.logoUrl ? (
                          <img
                            src={row.logoUrl}
                            alt={row.name}
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 shrink-0 rounded-full bg-brand-subtle" />
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="block font-semibold text-text-primary">{row.name}</span>
                          <span className="block text-xs leading-tight text-text-secondary">
                            {row.address}
                          </span>
                        </div>
                      </div>
                    );
                  case 'type':
                    return <Badge variant="brand">{row.establishmentType}</Badge>;
                  case 'price':
                    return typeof row.priceBucket === 'string' ? `R$ ${row.priceBucket}` : 'N/A';
                  case 'creator':
                    return (
                      <div className="flex flex-col gap-0.5">
                        <span className="block font-medium text-text-primary">
                          {row.creatorNickname ?? row.createdBy}
                        </span>
                        <span className="block text-xs text-text-secondary">
                          {formatRelativeTime(row.createdAt)}
                        </span>
                      </div>
                    );
                  case 'status':
                    return <Badge variant="warning">Pendente</Badge>;
                  case 'actions':
                    return (
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApprovePlace(row.id)}
                          title="Aprovar"
                          aria-label={`Aprovar ${row.name}`}
                          className="hover:bg-success/10 hover:text-success"
                          disabled={isRowBusy}
                        >
                          <CheckCircle size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenRejectModal(row.id, row.name)}
                          title="Rejeitar"
                          aria-label={`Rejeitar ${row.name}`}
                          className="hover:bg-error/10 hover:text-error"
                          disabled={isRowBusy}
                        >
                          <XCircle size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewPlace(row.id)}
                          title="Visualizar"
                          aria-label={`Visualizar ${row.name}`}
                          className="hover:bg-brand/5 hover:text-brand"
                          disabled={isRowBusy}
                        >
                          <Eye size={18} />
                        </Button>
                      </div>
                    );
                  default:
                    return value as React.ReactNode;
                }
              }}
            />
          </>
        ) : (
          <EmptyState
            title="Nenhum lugar aguardando aprovação"
            description="Todos os cadastros pendentes foram processados. Excelente trabalho!"
            icon="✓"
          />
        )}
      </div>

      {/* Reject Modal */}
      {selectedPlace && (
        <RejectModal
          isOpen={isRejectModalOpen}
          placeId={selectedPlace.id}
          placeName={selectedPlace.name}
          isLoading={rejectingIds.has(selectedPlace.id)}
          onClose={handleCloseRejectModal}
          onConfirm={handleConfirmReject}
        />
      )}

      {toastMessage && <Toast type={toastMessage.type}>{toastMessage.text}</Toast>}
    </>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m atrás`;
  }
  if (diffHours < 24) {
    return `${diffHours}h atrás`;
  }
  return `${diffDays}d atrás`;
}
