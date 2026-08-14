import { z } from 'zod';

export const serviceFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, 'Service label must be at least 2 characters')
    .max(100, 'Service label cannot exceed 100 characters'),
  default_unit_price: z.coerce.number().int().min(0, 'Price must be 0 or greater'),
  description: z.string().trim().max(500, 'Description too long').optional().nullable(),
  is_active: z.boolean().default(true),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export const packageItemFormSchema = z.object({
  id: z.string().optional(),
  service_id: z.string().nullable().optional(),
  label: z.string().trim().min(1, 'Item label is required').max(100, 'Label too long'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  unit_price: z.coerce.number().int().min(0, 'Unit price must be 0 or greater'),
  description: z.string().trim().max(300).optional().nullable(),
  position: z.number().int().default(0),
});

export type PackageItemFormValues = z.infer<typeof packageItemFormSchema>;

export const packageFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Package name must be at least 2 characters')
    .max(100, 'Package name cannot exceed 100 characters'),
  description: z.string().trim().max(500, 'Description too long').optional().nullable(),
  is_active: z.boolean().default(true),
  items: z.array(packageItemFormSchema).min(1, 'Package must contain at least 1 line item'),
});

export type PackageFormValues = z.infer<typeof packageFormSchema>;
