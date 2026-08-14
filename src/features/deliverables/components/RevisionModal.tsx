import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, RefreshCw } from 'lucide-react';
import { revisionFormSchema, type RevisionFormValues } from '../schemas/revisionSchemas';
import type { Deliverable } from '../types';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: RevisionFormValues) => Promise<void>;
  deliverable: Deliverable | null;
  isSubmitting?: boolean;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  deliverable,
  isSubmitting = false,
}) => {
  const nextRevNumber = (deliverable?.revisions?.length || 0) + 1;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RevisionFormValues>({
    resolver: zodResolver(revisionFormSchema),
    defaultValues: {
      feedback: '',
      due_date: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        feedback: '',
        due_date: '',
        notes: '',
      });
    }
  }, [isOpen, reset]);

  if (!isOpen || !deliverable) return null;

  const handleFormSubmit = async (values: RevisionFormValues) => {
    await onSubmit({
      ...values,
      due_date: values.due_date || undefined,
      notes: values.notes?.trim() || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="revision-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface shadow-xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div>
              <h2 id="revision-modal-title" className="text-base font-bold text-text-primary">
                Log Revision #{nextRevNumber}
              </h2>
              <p className="text-xs text-text-muted truncate max-w-xs">{deliverable.label}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Feedback */}
          <div>
            <label
              htmlFor="revision-feedback"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Client Feedback / Change Requests <span className="text-status-danger">*</span>
            </label>
            <div className="relative">
              <textarea
                id="revision-feedback"
                rows={4}
                placeholder="Specific adjustments requested by the client (timestamps, scene changes, color tweaks)..."
                {...register('feedback')}
                className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {errors.feedback && (
              <p className="mt-1 text-xs text-status-danger">{errors.feedback.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label
              htmlFor="revision-due-date"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Revised Due Date
            </label>
            <div className="relative">
              <input
                id="revision-due-date"
                type="date"
                {...register('due_date')}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {errors.due_date && (
              <p className="mt-1 text-xs text-status-danger">{errors.due_date.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="revision-notes"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Internal Notes (Optional)
            </label>
            <input
              id="revision-notes"
              type="text"
              placeholder="e.g., Export preset, editor assigned"
              {...register('notes')}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="revision-submit-btn"
              disabled={isSubmitting}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>Logging...</span>
                </>
              ) : (
                <span>Log Revision #{nextRevNumber}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
