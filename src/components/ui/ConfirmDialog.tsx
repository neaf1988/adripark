import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Volver',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      onClick={loading ? undefined : onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-xl font-bold text-gray-900">
          {title}
        </h2>
        <div className="mt-3 text-base leading-relaxed text-gray-600">{message}</div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? 'Procesando...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
