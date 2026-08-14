import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteContactDialogProps {
  isOpen: boolean;
  contactName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteContactDialog: React.FC<DeleteContactDialogProps> = ({
  isOpen,
  contactName,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-center gap-3 text-status-danger">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-status-danger/10 text-status-danger">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 id="delete-dialog-title" className="text-sm font-bold text-text-primary">
              Delete Contact
            </h2>
            <p className="text-xs text-text-muted">Irreversible action</p>
          </div>
        </div>

        <p id="delete-dialog-desc" className="mt-3 text-xs text-text-secondary">
          Are you sure you want to remove{' '}
          <strong className="text-text-primary">{contactName}</strong> from this client?
        </p>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="confirm-delete-contact-btn"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-status-danger px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Contact</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
