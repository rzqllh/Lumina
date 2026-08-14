import React from 'react';
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { formatIDR, parseMoneyInput } from '@/lib/money';
import type { PackageFormValues } from '../schemas/catalogSchemas';
import type { Service } from '../types/catalogTypes';

interface PackageItemRowProps {
  index: number;
  register: UseFormRegister<PackageFormValues>;
  watch: UseFormWatch<PackageFormValues>;
  setValue: UseFormSetValue<PackageFormValues>;
  onRemove: (index: number) => void;
  services: Service[];
  canRemove: boolean;
}

export const PackageItemRow: React.FC<PackageItemRowProps> = ({
  index,
  register,
  watch,
  setValue,
  onRemove,
  services,
  canRemove,
}) => {
  const selectedServiceId = watch(`items.${index}.service_id`);
  const quantity = watch(`items.${index}.quantity`) || 1;
  const unitPrice = watch(`items.${index}.unit_price`) || 0;
  const lineSubtotal = quantity * unitPrice;

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = e.target.value;
    if (!serviceId) {
      setValue(`items.${index}.service_id`, null);
      return;
    }

    const srv = services.find((s) => s.id === serviceId);
    if (srv) {
      setValue(`items.${index}.service_id`, srv.id);
      setValue(`items.${index}.label`, srv.label);
      setValue(`items.${index}.unit_price`, srv.default_unit_price);
    }
  };

  return (
    <div
      data-testid={`package-item-row-${index}`}
      className="space-y-3 rounded-xl border border-border bg-surface-muted/30 p-3.5 sm:p-4"
    >
      {/* Top line: Service Preset Selector & Remove Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 max-w-xs">
          <label
            htmlFor={`items.${index}.service_id`}
            className="block text-[11px] font-semibold text-text-muted mb-1"
          >
            Catalog Service Template
          </label>
          <select
            id={`items.${index}.service_id`}
            data-testid={`service-select-${index}`}
            value={selectedServiceId || ''}
            onChange={handleServiceChange}
            className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Custom Line Item (Manual)</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} ({formatIDR(s.default_unit_price)})
              </option>
            ))}
          </select>
        </div>

        {canRemove && (
          <button
            type="button"
            data-testid={`remove-item-${index}`}
            onClick={() => onRemove(index)}
            title="Remove item"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-text-muted hover:bg-status-danger/10 hover:text-status-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Grid: Item Label, Quantity, Unit Price, Line Subtotal */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end">
        {/* Label */}
        <div className="sm:col-span-6">
          <label
            htmlFor={`items.${index}.label`}
            className="block text-[11px] font-semibold text-text-primary mb-1"
          >
            Item Label <span className="text-status-danger">*</span>
          </label>
          <input
            id={`items.${index}.label`}
            type="text"
            placeholder="e.g. Lead Photographer (8 Hours)"
            {...register(`items.${index}.label`)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Quantity */}
        <div className="sm:col-span-2">
          <label
            htmlFor={`items.${index}.quantity`}
            className="block text-[11px] font-semibold text-text-primary mb-1"
          >
            Qty
          </label>
          <input
            id={`items.${index}.quantity`}
            type="number"
            min="1"
            {...register(`items.${index}.quantity`, {
              valueAsNumber: true,
            })}
            className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Unit Price */}
        <div className="sm:col-span-4">
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor={`items.${index}.unit_price`}
              className="block text-[11px] font-semibold text-text-primary"
            >
              Unit Price (IDR)
            </label>
            <span className="text-[11px] font-bold text-primary">
              Subtotal: {formatIDR(lineSubtotal)}
            </span>
          </div>
          <input
            id={`items.${index}.unit_price`}
            type="number"
            min="0"
            step="50000"
            {...register(`items.${index}.unit_price`, {
              setValueAs: (v) => parseMoneyInput(v),
            })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
    </div>
  );
};
