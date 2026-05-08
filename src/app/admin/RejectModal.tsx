'use client';

import { useEffect, useRef, useState } from 'react';
import { Sheet, Button, Textarea } from '@/presentation/components/ui';

interface RejectModalProps {
  isOpen: boolean;
  placeId: string;
  placeName: string;
  onClose: () => void;
  onConfirm: (placeId: string, reason: string) => void;
}

export function RejectModal({ isOpen, placeId, onClose, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const charCount = reason.length;
  const maxChars = 200;

  const getCharCounterColor = () => {
    if (charCount >= 180) return 'text-error';
    if (charCount >= 150) return 'text-warning';
    return 'text-text-secondary';
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert('Por favor, explique o motivo da rejeição.');
      return;
    }

    onConfirm(placeId, reason);
    handleClose();
  };

  return (
    <Sheet open={isOpen} onClose={handleClose} title="Rejeitar cadastro">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Textarea
            ref={textareaRef}
            id="rejectReason"
            label="Motivo da rejeição"
            placeholder="Explique ao usuário por que o cadastro foi rejeitado..."
            maxLength={maxChars}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
          <div className={`text-right text-xs ${getCharCounterColor()}`}>
            <span>{charCount}</span>/{maxChars} caracteres
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          Confirmar rejeição
        </Button>
      </div>
    </Sheet>
  );
}
