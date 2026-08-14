import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Receipt } from 'lucide-react';
import { expenseFormSchema, type ExpenseFormValues } from '../schemas/financeSchemas';
import type { Expense } from '../types';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ExpenseFormValues) => Promise<void>;
  initialData?: Expense | null;
  currency?: string;
  isSubmitting?: boolean;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
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
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      label: initialData?.label || '',
      amount: initialData?.amount || 0,
      date: initialData?.date || new Date().toISOString().split('T')[0],
      category: initialData?.category || '',
      notes: initialData?.notes || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          label: initialData.label,
          amount: initialData.amount,
          date: initialData.date,
          category: initialData.category || '',
          notes: initialData.notes || '',
        });
      } else {
        reset({
          label: '',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          category: '',
          notes: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: ExpenseFormValues) => {
    await onSubmit({
      ...values,
      category: values.category?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    });
  };

  const commonCategories = [
    'Transport & Gas',
    'Equipment Rental',
    'Permits & Location',
    'Studio Rental',
    'Catering & Meals',
    'Props & Wardrobe',
    'Software & Licensing',
    'Other',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface shadow-xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
              <Receipt className="h-4 w-4" />
            </div>
            <h2 id="expense-modal-title" className="text-base font-bold text-text-primary">
              {isEditing ? 'Edit Expense' : 'Record Project Expense'}
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
              htmlFor="expense-label"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Expense Description <span className="text-status-danger">*</span>
            </label>
            <input
              id="expense-label"
              type="text"
              placeholder="e.g., Cinema Lens Rental, Studio Booking Fee"
              {...register('label')}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.label && (
              <p className="mt-1 text-xs text-status-danger">{errors.label.message}</p>
            )}
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="expense-amount"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                Amount ({currency}) <span className="text-status-danger">*</span>
              </label>
              <input
                id="expense-amount"
                type="number"
                min="0"
                placeholder="e.g., 1500000"
                {...register('amount', { valueAsNumber: true })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-status-danger">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="expense-date"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                Date <span className="text-status-danger">*</span>
              </label>
              <input
                id="expense-date"
                type="date"
                {...register('date')}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.date && (
                <p className="mt-1 text-xs text-status-danger">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="expense-category"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Category
            </label>
            <input
              id="expense-category"
              type="text"
              list="category-suggestions"
              placeholder="e.g., Equipment Rental"
              {...register('category')}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <datalist id="category-suggestions">
              {commonCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="expense-notes"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Notes
            </label>
            <textarea
              id="expense-notes"
              rows={2}
              placeholder="Vendor info, receipt details..."
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
              data-testid="expense-submit-btn"
              disabled={isSubmitting}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Record Expense'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
