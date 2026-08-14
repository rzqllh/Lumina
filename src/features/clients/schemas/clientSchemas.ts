import { z } from 'zod';

export const clientFormSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name cannot exceed 100 characters'),
  client_type: z.enum(['individual', 'couple', 'organization', 'custom'], {
    errorMap: () => ({ message: 'Please select a valid client type' }),
  }),
  custom_type_label: z
    .string()
    .trim()
    .max(50, 'Custom label cannot exceed 50 characters')
    .optional()
    .nullable(),
  email: z.string().trim().email('Invalid email address').or(z.literal('')).optional().nullable(),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number cannot exceed 30 characters')
    .optional()
    .nullable(),
  notes: z.string().trim().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable(),
  is_archived: z.boolean().default(false),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Contact name must be at least 2 characters')
    .max(100, 'Contact name cannot exceed 100 characters'),
  role_label: z
    .string()
    .trim()
    .max(50, 'Role label cannot exceed 50 characters')
    .optional()
    .nullable(),
  email: z.string().trim().email('Invalid email address').or(z.literal('')).optional().nullable(),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number cannot exceed 30 characters')
    .optional()
    .nullable(),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
  is_primary: z.boolean().default(false),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
