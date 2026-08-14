import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatIDR } from '@/lib/money';
import {
  projectServiceFormSchema,
  type ProjectServiceFormValues,
  moneyFieldConfig,
} from '../schemas/projectPricingSchemas';
import type { ProjectService, ServicePickerItem } from '../types/projectPricingTypes';

interface ProjectServiceFormProps {
  initial?: ProjectService;
  prefill?: {
    label: string;
    description?: string | null;
    unit_price: number;
    source_service_id?: string | null;
  };
  onSubmit: (values: ProjectServiceFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  availableServices?: ServicePickerItem[];
}

export function ProjectServiceForm({
  initial,
  prefill,
  onSubmit,
  onCancel,
  isLoading,
  availableServices = [],
}: ProjectServiceFormProps) {
  const isEditing = Boolean(initial);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectServiceFormValues>({
    resolver: zodResolver(projectServiceFormSchema),
    defaultValues: initial
      ? {
          label: initial.label,
          description: initial.description ?? '',
          quantity: initial.quantity,
          unit_price: initial.unit_price,
          adjustment_label: initial.adjustment_label ?? '',
          adjustment_amount: initial.adjustment_amount,
        }
      : prefill
        ? {
            label: prefill.label,
            description: prefill.description ?? '',
            quantity: 1,
            unit_price: prefill.unit_price,
            adjustment_label: '',
            adjustment_amount: 0,
            source_service_id: prefill.source_service_id ?? null,
          }
        : {
            label: '',
            description: '',
            quantity: 1,
            unit_price: 0,
            adjustment_label: '',
            adjustment_amount: 0,
          },
  });

  const quantity = watch('quantity');
  const unitPrice = watch('unit_price');
  const adjustmentAmount = watch('adjustment_amount');

  const safeQty = isNaN(quantity) ? 0 : quantity;
  const safePrice = isNaN(unitPrice) ? 0 : unitPrice;
  const safeAdj = isNaN(adjustmentAmount) ? 0 : adjustmentAmount;

  const subtotal = safeQty * safePrice;
  const netLineTotal = subtotal + safeAdj;

  // When a service is selected from the picker, pre-fill label and price
  function handleServiceSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const serviceId = e.target.value;
    if (!serviceId) return;
    const service = availableServices.find((s) => s.id === serviceId);
    if (service) {
      setValue('label', service.label);
      setValue('unit_price', service.default_unit_price);
      setValue('source_service_id', service.id);
      if (service.description) setValue('description', service.description);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Service template picker (only shown when adding) */}
      {!isEditing && availableServices.length > 0 && (
        <div>
          <label
            htmlFor="service-template-select"
            className="block text-xs font-semibold text-text-secondary mb-1.5"
          >
            From catalog service <span className="text-text-muted">(optional)</span>
          </label>
          <select
            id="service-template-select"
            data-testid="service-template-select"
            onChange={handleServiceSelect}
            defaultValue=""
            className="w-full cursor-pointer rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">— Select a service to pre-fill —</option>
            {availableServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} · {formatIDR(s.default_unit_price)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-text-muted">
            Selecting pre-fills label and price as a snapshot. You can edit them below.
          </p>
        </div>
      )}

      {/* Label */}
      <div>
        <label
          htmlFor="ps-label"
          className="block text-xs font-semibold text-text-secondary mb-1.5"
        >
          Service label{' '}
          <span className="text-status-danger" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="ps-label"
          type="text"
          {...register('label')}
          placeholder="e.g. Wedding Photography (Full Day)"
          aria-required="true"
          aria-invalid={Boolean(errors.label)}
          aria-describedby={errors.label ? 'ps-label-error' : undefined}
          className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.label && (
          <p id="ps-label-error" role="alert" className="mt-1 text-[11px] text-status-danger">
            {errors.label.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="ps-description"
          className="block text-xs font-semibold text-text-secondary mb-1.5"
        >
          Description <span className="text-text-muted">(optional)</span>
        </label>
        <textarea
          id="ps-description"
          rows={2}
          {...register('description')}
          placeholder="Optional details or notes"
          className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Quantity and Unit Price */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="ps-quantity"
            className="block text-xs font-semibold text-text-secondary mb-1.5"
          >
            Quantity{' '}
            <span className="text-status-danger" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="ps-quantity"
            type="number"
            min="1"
            step="1"
            {...register('quantity')}
            aria-required="true"
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby={errors.quantity ? 'ps-quantity-error' : undefined}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {errors.quantity && (
            <p id="ps-quantity-error" role="alert" className="mt-1 text-[11px] text-status-danger">
              {errors.quantity.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="ps-unit-price"
            className="block text-xs font-semibold text-text-secondary mb-1.5"
          >
            Unit Price (IDR){' '}
            <span className="text-status-danger" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="ps-unit-price"
            type="text"
            inputMode="numeric"
            {...register('unit_price', moneyFieldConfig)}
            placeholder="0"
            aria-required="true"
            aria-invalid={Boolean(errors.unit_price)}
            aria-describedby={errors.unit_price ? 'ps-unit-price-error' : 'ps-unit-price-hint'}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p id="ps-unit-price-hint" className="mt-1 text-[11px] text-text-muted">
            Enter whole Rupiah (e.g. 2500000)
          </p>
          {errors.unit_price && (
            <p
              id="ps-unit-price-error"
              role="alert"
              className="mt-1 text-[11px] text-status-danger"
            >
              {errors.unit_price.message}
            </p>
          )}
        </div>
      </div>

      {/* Adjustment */}
      <div>
        <p className="text-xs font-semibold text-text-secondary mb-1.5">
          Adjustment <span className="text-text-muted">(optional discount or extra charge)</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ps-adjustment-label" className="sr-only">
              Adjustment label
            </label>
            <input
              id="ps-adjustment-label"
              type="text"
              {...register('adjustment_label')}
              placeholder="e.g. Discount, Extra Hour"
              aria-label="Adjustment label"
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="ps-adjustment-amount" className="sr-only">
              Adjustment amount (IDR, use negative for discount)
            </label>
            <input
              id="ps-adjustment-amount"
              type="number"
              step="1"
              {...register('adjustment_amount')}
              placeholder="0 (negative = discount)"
              aria-label="Adjustment amount (IDR, use negative for discount)"
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
        <p className="mt-1 text-[11px] text-text-muted">
          Use a negative value (e.g. -500000) for a discount
        </p>
      </div>

      {/* Live preview */}
      <div
        className="rounded-xl border border-primary/20 bg-purple-50/50 px-4 py-3"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span>
            Subtotal ({safeQty} × {formatIDR(safePrice)})
          </span>
          <span className="font-semibold tabular-nums">{formatIDR(subtotal)}</span>
        </div>
        {safeAdj !== 0 && (
          <div className="flex justify-between text-xs text-text-secondary mb-1">
            <span>Adjustment</span>
            <span className="font-semibold tabular-nums">
              {safeAdj < 0 ? `−${formatIDR(Math.abs(safeAdj))}` : `+${formatIDR(safeAdj)}`}
            </span>
          </div>
        )}
        <div className="flex justify-between border-t border-primary/15 pt-1.5">
          <span className="text-xs font-bold text-text-primary">Net Line Total</span>
          <span
            data-testid="ps-form-net-total-preview"
            className="text-sm font-bold tabular-nums text-primary"
          >
            {formatIDR(netLineTotal)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 cursor-pointer rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          data-testid="ps-form-submit-btn"
          disabled={isLoading}
          className="flex-1 cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? 'Saving…' : isEditing ? 'Update Service' : 'Add Service'}
        </button>
      </div>
    </form>
  );
}
