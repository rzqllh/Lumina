import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, X } from 'lucide-react';
import { forceCloseFormSchema, type ForceCloseFormValues } from '../schemas/financeSchemas';

interface ForceCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const ForceCloseModal: React.FC<ForceCloseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForceCloseFormValues>({
    resolver: zodResolver(forceCloseFormSchema),
    defaultValues: {
      reason: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ reason: '' });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: ForceCloseFormValues) => {
    await onConfirm(values.reason.trim());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="force-close-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md rounded-xl border border-status-danger-border bg-surface shadow-sheet flex flex-col p-6 space-y-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-status-danger-subtle text-status-danger-text border border-status-danger-border">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2
                id="force-close-modal-title"
                className="text-base font-semibold text-text-primary"
              >
                Force-Close Project
              </h2>
              <p className="text-xs text-text-muted">Owner Override Action</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Warning Explanation */}
        <div className="rounded-lg border border-status-danger-border bg-status-danger-subtle p-3 text-xs text-status-danger-text space-y-1.5">
          <p className="font-semibold">Operational Freeze Effect:</p>
          <ul className="list-disc pl-4 space-y-1 text-xs text-status-danger-text/90">
            <li>Creating new tasks, workflow stages, deliverables, or expenses will be locked.</li>
            <li>Unpaid balances remain unchanged (never silently marked as paid).</li>
            <li>Receiving incoming late payments is still permitted for cashflow tracking.</li>
            <li>You can explicitly reopen the project later if work resumes.</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="force-close-reason"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
            >
              Permanent Written Reason <span className="text-status-danger-text">*</span>
            </label>
            <textarea
              id="force-close-reason"
              rows={3}
              placeholder="e.g., Client cancelled event, agreed partial delivery, client defaulted on balance..."
              {...register('reason')}
              className="w-full rounded-lg border border-border bg-surface p-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-status-danger-text">{errors.reason.message}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="confirm-force-close-btn"
              disabled={isSubmitting}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-status-danger px-4 py-2 text-xs font-semibold text-white hover:bg-status-danger/90 transition-colors shadow-subtle disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Freezing...</span>
                </>
              ) : (
                <span>Confirm Force-Close</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
