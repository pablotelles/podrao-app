'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Sheet, Button, Textarea } from '@/presentation/components/ui';

interface RejectModalProps {
  isOpen: boolean;
  placeId: string;
  placeName: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (placeId: string, reason: string) => void;
}

export function RejectModal({
  isOpen,
  placeId,
  placeName,
  isLoading = false,
  onClose,
  onConfirm,
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
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
    if (isLoading) return;
    setReason('');
    setValidationError(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      setValidationError('Por favor, explique o motivo da rejeição.');
      return;
    }
    setValidationError(null);
    onConfirm(placeId, reason);
  };

  return (
    <Sheet open={isOpen} onClose={handleClose} title={`Rejeitar: ${placeName}`}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Textarea
            ref={textareaRef}
            id="rejectReason"
            label="Motivo da rejeição"
            placeholder="Explique ao usuário por que o cadastro foi rejeitado..."
            maxLength={maxChars}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (validationError) setValidationError(null);
            }}
            rows={4}
            disabled={isLoading}
          />
          {validationError && <p className="text-sm text-error">{validationError}</p>}
          <div className={`text-right text-xs ${getCharCounterColor()}`}>
            <span>{charCount}</span>/{maxChars} caracteres
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Rejeitando...
            </>
          ) : (
            'Confirmar rejeição'
          )}
        </Button>
      </div>
    </Sheet>
  );
}
