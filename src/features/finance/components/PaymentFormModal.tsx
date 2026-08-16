import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, CreditCard } from 'lucide-react';
import { paymentFormSchema, type PaymentFormValues } from '../schemas/financeSchemas';
import type { Payment, PaymentType } from '../types';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: PaymentFormValues) => Promise<void>;
  initialData?: Payment | null;
  currency?: string;
  isSubmitting?: boolean;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  currency = 'IDR',
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      type: initialData?.type || 'installment',
      label: initialData?.label || '',
      amount: initialData?.amount || 0,
      due_date: initialData?.due_date || new Date().toISOString().split('T')[0],
      status: initialData?.status || 'pending',
      paid_date: initialData?.paid_date || '',
      payment_method: initialData?.payment_method || '',
      notes: initialData?.notes || '',
    },
  });

  const selectedStatus = watch('status');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          type: initialData.type,
          label: initialData.label || '',
          amount: initialData.amount,
          due_date: initialData.due_date,
          status: initialData.status,
          paid_date: initialData.paid_date || '',
          payment_method: initialData.payment_method || '',
          notes: initialData.notes || '',
        });
      } else {
        reset({
          type: 'installment',
          label: '',
          amount: 0,
          due_date: new Date().toISOString().split('T')[0],
          status: 'pending',
          paid_date: '',
          payment_method: '',
          notes: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: PaymentFormValues) => {
    await onSubmit({
      ...values,
      label: values.label?.trim() || undefined,
      paid_date: values.status === 'paid' ? values.paid_date || values.due_date : undefined,
      payment_method: values.payment_method?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    });
  };

  const paymentTypes: { value: PaymentType; label: string }[] = [
    { value: 'dp', label: 'Down Payment (DP)' },
    { value: 'installment', label: 'Progress Installment' },
    { value: 'final', label: 'Final Settlement' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md rounded-xl border border-border bg-surface shadow-sheet flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary-text border border-primary-border">
              <CreditCard className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 id="payment-modal-title" className="text-base font-semibold text-text-primary">
                {isEditing ? 'Edit Payment Milestone' : 'Schedule Payment'}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing
                  ? 'Update payment milestone and status.'
                  : 'Schedule an incoming client payment.'}
              </p>
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

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Type & Label */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="payment-type"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
              >
                Payment Type
              </label>
              <select
                id="payment-type"
                {...register('type')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {paymentTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="payment-label"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
              >
                Label / Milestone
              </label>
              <input
                id="payment-label"
                type="text"
                placeholder="e.g., 50% Initial Booking DP"
                {...register('label')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Amount & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="payment-amount"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
              >
                Amount ({currency}) <span className="text-status-danger-text">*</span>
              </label>
              <input
                id="payment-amount"
                type="number"
                min="1"
                placeholder="e.g., 5000000"
                {...register('amount', { valueAsNumber: true })}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-status-danger-text">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="payment-due-date"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
              >
                Due Date <span className="text-status-danger-text">*</span>
              </label>
              <input
                id="payment-due-date"
                type="date"
                {...register('due_date')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.due_date && (
                <p className="mt-1 text-xs text-status-danger-text">{errors.due_date.message}</p>
              )}
            </div>
          </div>

          {/* Status & Paid Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="payment-status"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
              >
                Payment Status
              </label>
              <select
                id="payment-status"
                {...register('status')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {selectedStatus === 'paid' && (
              <div>
                <label
                  htmlFor="payment-paid-date"
                  className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
                >
                  Paid Date
                </label>
                <input
                  id="payment-paid-date"
                  type="date"
                  {...register('paid_date')}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label
              htmlFor="payment-method"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
            >
              Payment Method (Optional)
            </label>
            <input
              id="payment-method"
              type="text"
              placeholder="e.g., Bank Transfer (BCA), QRIS, Cash"
              {...register('payment_method')}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="payment-notes"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
            >
              Notes
            </label>
            <textarea
              id="payment-notes"
              rows={2}
              placeholder="Payment reference, receipt info..."
              {...register('notes')}
              className="w-full rounded-lg border border-border bg-surface p-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
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
              data-testid="payment-submit-btn"
              disabled={isSubmitting}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Schedule Payment'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
