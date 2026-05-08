'use client';

import React, { useState } from 'react';
import { Eye, XCircle, CheckCircle } from 'lucide-react';
import { Button, Badge, DataTable, EmptyState } from '@/presentation/components/ui';
import { AdminFilters } from './AdminFilters';
import { RejectModal } from './RejectModal';
import { mockPendingPlaces } from './mock-data';
import type { Place } from '@/domain/entities/Place';

const PAGE_SIZE = 5;

export default function AdminPage() {
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>(mockPendingPlaces);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{ id: string; name: string } | null>(null);

  const pendingCount = mockPendingPlaces.length;
  const totalPages = Math.ceil(filteredPlaces.length / PAGE_SIZE);
  const paginatedPlaces = filteredPlaces.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleFiltersChange = (filtered: Place[]) => {
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

  const handleApprovePlace = (placeId: string, placeName: string) => {
    console.log(`Approved place: ${placeId} (${placeName})`);
    alert(`Lugar "${placeName}" aprovado!\n\n(Este é um mockup — a aprovação não será processada)`);
  };

  const handleConfirmReject = (placeId: string, reason: string) => {
    console.log(`Rejected place: ${placeId}, reason: ${reason}`);
    alert(
      `Lugar rejeitado com motivo:\n\n"${reason}"\n\n(Este é um mockup — a rejeição não será processada)`,
    );
    handleCloseRejectModal();
  };

  const handleViewPlace = (placeId: string, placeName: string) => {
    console.log(`View place: ${placeId}`);
    alert(
      `Navegando para detalhe de "${placeName}"...\n\n(Este é um mockup — linkaria para /places/${placeId})`,
    );
  };

  return (
    <>
      <div>
        {filteredPlaces.length > 0 ? (
          <>
            {/* Header Section */}
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold text-text-primary">Aguardando Aprovação</h2>
              <Badge variant="warning">{pendingCount} lugares pendentes</Badge>
            </div>

            {/* Filters */}
            <AdminFilters places={mockPendingPlaces} onFiltersChange={handleFiltersChange} />

            {/* Table */}
            <DataTable
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
              renderCell={(columnKey, value, _row) => {
                const row = _row as unknown as Place;
                switch (columnKey) {
                  case 'name':
                    return (
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 shrink-0 rounded-full bg-brand"
                          title={row.name}
                        />
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
                        <span className="block font-medium text-text-primary">{row.createdBy}</span>
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
                          onClick={() => handleApprovePlace(row.id, row.name)}
                          title="Aprovar"
                          aria-label={`Aprovar ${row.name}`}
                          className="hover:bg-green-50 hover:text-success"
                        >
                          <CheckCircle size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenRejectModal(row.id, row.name)}
                          title="Rejeitar"
                          aria-label={`Rejeitar ${row.name}`}
                          className="hover:bg-red-50 hover:text-error"
                        >
                          <XCircle size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewPlace(row.id, row.name)}
                          title="Visualizar"
                          aria-label={`Visualizar ${row.name}`}
                          className="hover:bg-brand/5 hover:text-brand"
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
          onClose={handleCloseRejectModal}
          onConfirm={handleConfirmReject}
        />
      )}
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
