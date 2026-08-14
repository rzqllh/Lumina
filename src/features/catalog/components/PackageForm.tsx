import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Calculator } from 'lucide-react';
import { packageFormSchema, type PackageFormValues } from '../schemas/catalogSchemas';
import { useServices } from '../hooks/useServices';
import { PackageItemRow } from './PackageItemRow';
import { formatIDR } from '@/lib/money';

interface PackageFormProps {
  initialValues?: Partial<PackageFormValues>;
  onSubmit: (values: PackageFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
  submitLabel?: string;
  isEdit?: boolean;
}

export const PackageForm: React.FC<PackageFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError = null,
  submitLabel = 'Create Package',
  isEdit = false,
}) => {
  // Query active services for item templates
  const { data: services = [] } = useServices(true);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      is_active: initialValues?.is_active ?? true,
      items:
        initialValues?.items && initialValues.items.length > 0
          ? initialValues.items
          : [
              {
                label: 'Main Service',
                quantity: 1,
                unit_price: 1500000,
                service_id: null,
                position: 0,
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items') || [];
  const calculatedTotal = watchedItems.reduce(
    (sum, item) => sum + (item?.quantity || 1) * (item?.unit_price || 0),
    0
  );

  const handleAddItem = () => {
    append({
      label: '',
      quantity: 1,
      unit_price: 0,
      service_id: null,
      position: fields.length,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div
          role="alert"
          data-testid="package-form-error-alert"
          className="rounded-xl border border-status-danger/25 bg-status-danger/8 p-4 text-xs font-medium text-status-danger"
        >
          {serverError}
        </div>
      )}

      {/* Package Header Section */}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-text-primary mb-1.5">
            Package Preset Name <span className="text-status-danger">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Wedding Full Day Premium or Graduation Solo Portrait"
            {...register('name')}
            className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
              errors.name ? 'border-status-danger' : 'border-border'
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-status-danger">{errors.name.message}</p>}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-xs font-semibold text-text-primary mb-1.5"
          >
            Package Description
          </label>
          <textarea
            id="description"
            rows={2}
            placeholder="Summary of deliverables and scope in this preset..."
            {...register('description')}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {isEdit && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/30 p-3.5">
            <div>
              <span className="text-xs font-semibold text-text-primary block">
                Active in Catalog
              </span>
              <span className="text-[11px] text-text-muted">
                Archived packages cannot be assigned to new projects.
              </span>
            </div>
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Package Line Items Section */}
      <div className="space-y-4 pt-4 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Package Line Items ({fields.length})
            </h2>
            <p className="text-[11px] text-text-muted">
              Add services or custom line items to this preset.
            </p>
          </div>

          <button
            type="button"
            data-testid="add-item-btn"
            onClick={handleAddItem}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {errors.items?.root && (
          <p className="text-xs text-status-danger">{errors.items.root.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, idx) => (
            <PackageItemRow
              key={field.id}
              index={idx}
              register={register}
              watch={watch}
              setValue={setValue}
              onRemove={remove}
              services={services}
              canRemove={fields.length > 1}
            />
          ))}
        </div>
      </div>

      {/* Live Computed Total Card */}
      <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-purple-50/50 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-primary">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-text-primary block">
              Calculated Catalog Preset Total
            </span>
            <span className="text-[11px] text-text-muted">
              Total across {fields.length} line {fields.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        <span
          data-testid="package-calculated-total"
          className="text-lg font-bold text-primary sm:text-xl"
        >
          {formatIDR(calculatedTotal)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="package-submit-btn"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 active:scale-[0.99]"
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
