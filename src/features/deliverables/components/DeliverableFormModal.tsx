import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Package } from 'lucide-react';
import { deliverableFormSchema, type DeliverableFormValues } from '../schemas/deliverableSchemas';
import type { Deliverable } from '../types';

interface DeliverableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: DeliverableFormValues) => Promise<void>;
  initialData?: Deliverable | null;
  isSubmitting?: boolean;
}

export const DeliverableFormModal: React.FC<DeliverableFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeliverableFormValues>({
    resolver: zodResolver(deliverableFormSchema),
    defaultValues: {
      label: initialData?.label || '',
      quantity: initialData?.quantity ?? undefined,
      type_label: initialData?.type_label || '',
      deadline: initialData?.deadline || '',
      status: initialData?.status || 'planned',
      notes: initialData?.notes || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          label: initialData.label,
          quantity: initialData.quantity ?? undefined,
          type_label: initialData.type_label || '',
          deadline: initialData.deadline || '',
          status: initialData.status,
          notes: initialData.notes || '',
        });
      } else {
        reset({
          label: '',
          quantity: undefined,
          type_label: '',
          deadline: '',
          status: 'planned',
          notes: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: DeliverableFormValues) => {
    await onSubmit({
      ...values,
      quantity:
        values.quantity !== undefined && values.quantity !== null && !isNaN(values.quantity)
          ? Number(values.quantity)
          : null,
      type_label: values.type_label?.trim() || undefined,
      deadline: values.deadline || undefined,
      notes: values.notes?.trim() || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deliverable-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface shadow-xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="h-4 w-4" />
            </div>
            <h2 id="deliverable-modal-title" className="text-base font-bold text-text-primary">
              {isEditing ? 'Edit Deliverable' : 'Add Promised Deliverable'}
            </h2>
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
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Label */}
          <div>
            <label
              htmlFor="deliverable-label"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Deliverable Title <span className="text-status-danger">*</span>
            </label>
            <input
              id="deliverable-label"
              type="text"
              placeholder="e.g., 50 Edited Photos, 4K Highlight Reel, Reels Cut"
              {...register('label')}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.label && (
              <p className="mt-1 text-xs text-status-danger">{errors.label.message}</p>
            )}
          </div>

          {/* Grid: Quantity & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="deliverable-quantity"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                Quantity (Units/Files)
              </label>
              <input
                id="deliverable-quantity"
                type="number"
                min="1"
                placeholder="e.g., 50"
                {...register('quantity', { valueAsNumber: true })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-status-danger">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="deliverable-type"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                Category / Format
              </label>
              <input
                id="deliverable-type"
                type="text"
                placeholder="e.g., Video, Photos, Album"
                {...register('type_label')}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Deadline and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="deliverable-deadline"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                Target Delivery Deadline
              </label>
              <input
                id="deliverable-deadline"
                type="date"
                {...register('deadline')}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="deliverable-status"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                Status
              </label>
              <select
                id="deliverable-status"
                {...register('status')}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="delivered">Delivered</option>
                <option value="awaiting_review">Awaiting Review</option>
                <option value="approved">Approved</option>
                <option value="revision_requested">Revision Requested</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="deliverable-notes"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Notes & Technical Specs
            </label>
            <textarea
              id="deliverable-notes"
              rows={3}
              placeholder="Resolution, aspect ratio, audio mix notes, export settings..."
              {...register('notes')}
              className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
              data-testid="deliverable-submit-btn"
              disabled={isSubmitting}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Add Deliverable'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
