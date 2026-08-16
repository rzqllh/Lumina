import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientFormSchema, type ClientFormValues } from '../schemas/clientSchemas';
import type { ClientType } from '../types/clientTypes';

interface ClientFormProps {
  initialValues?: Partial<ClientFormValues>;
  onSubmit: (values: ClientFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
  submitLabel?: string;
  isEdit?: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError = null,
  submitLabel = 'Save Client',
  isEdit = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      display_name: initialValues?.display_name || '',
      client_type: (initialValues?.client_type as ClientType) || 'individual',
      custom_type_label: initialValues?.custom_type_label || '',
      email: initialValues?.email || '',
      phone: initialValues?.phone || '',
      notes: initialValues?.notes || '',
      is_archived: initialValues?.is_archived || false,
    },
  });

  const selectedType = watch('client_type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div
          role="alert"
          data-testid="client-form-error-alert"
          className="rounded-lg border border-status-danger-border bg-status-danger-subtle p-4 text-xs font-medium text-status-danger-text"
        >
          {serverError}
        </div>
      )}

      {/* Display Name */}
      <div>
        <label
          htmlFor="display_name"
          className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
        >
          Display Name <span className="text-status-danger-text">*</span>
        </label>
        <input
          id="display_name"
          type="text"
          placeholder="e.g. Sarah & Dave Wedding or Nexus Corp"
          {...register('display_name')}
          className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
            errors.display_name ? 'border-status-danger-border' : 'border-border'
          }`}
        />
        {errors.display_name && (
          <p className="mt-1 text-xs text-status-danger-text">{errors.display_name.message}</p>
        )}
      </div>

      {/* Client Type */}
      <div>
        <label
          htmlFor="client_type"
          className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
        >
          Client Type <span className="text-status-danger-text">*</span>
        </label>
        <select
          id="client_type"
          {...register('client_type')}
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="individual">Individual</option>
          <option value="couple">Couple (Wedding / Prewedding)</option>
          <option value="organization">Organization / Corporate</option>
          <option value="custom">Custom Identity</option>
        </select>
        {errors.client_type && (
          <p className="mt-1 text-xs text-status-danger-text">{errors.client_type.message}</p>
        )}
      </div>

      {/* Custom Type Label (Conditional) */}
      {selectedType === 'custom' && (
        <div>
          <label
            htmlFor="custom_type_label"
            className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Custom Type Label
          </label>
          <input
            id="custom_type_label"
            type="text"
            placeholder="e.g. Band / Collective / Agency"
            {...register('custom_type_label')}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}

      {/* Email & Phone Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Primary Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="client@example.com"
            {...register('email')}
            className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
              errors.email ? 'border-status-danger-border' : 'border-border'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-status-danger-text">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Primary Phone
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+62 812-3456-7890"
            {...register('phone')}
            className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
              errors.phone ? 'border-status-danger-border' : 'border-border'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-status-danger-text">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5"
        >
          Internal Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Client preferences, referral source, or background notes..."
          {...register('notes')}
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Archive Status Checkbox (Edit Only) */}
      {isEdit && (
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-muted/40 p-3.5">
          <input
            id="is_archived"
            type="checkbox"
            {...register('is_archived')}
            className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
          />
          <label
            htmlFor="is_archived"
            className="text-xs font-medium text-text-primary cursor-pointer"
          >
            Archive this client (Hides from active project assignment)
          </label>
        </div>
      )}

      {/* Action Buttons */}
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
