import { z } from 'zod';
import { parseMoneyInput } from '@/lib/money';

// ─── Project Service Form Schema ──────────────────────────────────────────────

export const projectServiceFormSchema = z.object({
  label: z.string().min(1, 'Service label is required').max(200),
  description: z.string().max(1000).nullable().optional(),
  quantity: z.coerce
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Minimum quantity is 1'),
  unit_price: z.coerce
    .number()
    .int('Unit price must be a whole number (IDR minor units)')
    .min(0, 'Price cannot be negative'),
  adjustment_label: z.string().max(200).nullable().optional(),
  adjustment_amount: z.coerce
    .number()
    .int('Adjustment must be a whole number (IDR minor units)')
    .default(0),
  source_service_id: z.string().uuid().nullable().optional(),
});

export type ProjectServiceFormValues = z.infer<typeof projectServiceFormSchema>;

// Transformer for money text input fields (strips non-digit characters to minor units)
export const moneyFieldConfig = {
  setValueAs: (v: string | number) => parseMoneyInput(String(v)),
};

// ─── Package Apply Schema ─────────────────────────────────────────────────────

export const applyPackageSchema = z.object({
  package_id: z.string().uuid('Please select a valid package'),
});

export type ApplyPackageValues = z.infer<typeof applyPackageSchema>;
