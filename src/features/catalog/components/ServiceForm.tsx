import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceFormSchema, type ServiceFormValues } from '../schemas/catalogSchemas';
import { formatIDR, parseMoneyInput } from '@/lib/money';

interface ServiceFormProps {
  initialValues?: Partial<ServiceFormValues>;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
  submitLabel?: string;
  isEdit?: boolean;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError = null,
  submitLabel = 'Create Service',
  isEdit = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      label: initialValues?.label || '',
      default_unit_price: initialValues?.default_unit_price ?? 0,
      description: initialValues?.description || '',
      is_active: initialValues?.is_active ?? true,
    },
  });

  const currentPrice = watch('default_unit_price');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div
          role="alert"
          data-testid="service-form-error-alert"
          className="rounded-lg border border-status-danger-border bg-status-danger-subtle p-4 text-xs font-medium text-status-danger-text"
        >
          {serverError}
        </div>
      )}

      {/* Service Label */}
      <div>
        <label
          htmlFor="label"
          className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
        >
          Service Name <span className="text-status-danger-text">*</span>
        </label>
        <input
          id="label"
          type="text"
          placeholder="e.g. Full Day Photography or Same Day Edit Video"
          {...register('label')}
          className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
            errors.label ? 'border-status-danger-border' : 'border-border'
          }`}
        />
        {errors.label && (
          <p className="mt-1 text-xs text-status-danger-text">{errors.label.message}</p>
        )}
      </div>

      {/* Default Unit Price */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="default_unit_price"
            className="block text-xs font-semibold uppercase tracking-wider text-text-muted"
          >
            Default Unit Price (IDR)
          </label>
          <span className="text-xs font-semibold tabular-nums text-primary-text">
            {formatIDR(currentPrice)}
          </span>
        </div>
        <input
          id="default_unit_price"
          type="number"
          min="0"
          step="50000"
          placeholder="0"
          {...register('default_unit_price', {
            setValueAs: (v) => parseMoneyInput(v),
          })}
          className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
            errors.default_unit_price ? 'border-status-danger-border' : 'border-border'
          }`}
        />
        {errors.default_unit_price && (
          <p className="mt-1 text-xs text-status-danger-text">
            {errors.default_unit_price.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
        >
          Description / Scope
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Optional notes or deliverables included with this service..."
          {...register('description')}
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Active Toggle (in Edit mode) */}
      {isEdit && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 p-3.5">
          <div>
            <span className="text-xs font-semibold text-text-primary block">Active in Catalog</span>
            <span className="text-xs text-text-muted">
              Archived services cannot be selected for new package items.
            </span>
          </div>
          <input
            type="checkbox"
            id="is_active"
            {...register('is_active')}
            className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="service-submit-btn"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
};
