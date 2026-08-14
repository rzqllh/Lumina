import { z } from 'zod';

export const projectFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Project title must be at least 2 characters')
    .max(120, 'Project title cannot exceed 120 characters'),
  client_id: z.string().min(1, 'Please select a valid client from the dropdown'),
  project_number: z
    .string()
    .trim()
    .max(50, 'Reference number cannot exceed 50 characters')
    .optional()
    .nullable(),
  status: z.enum(['draft', 'active', 'closed', 'force_closed', 'archived']).default('active'),
  currency: z.string().default('IDR'),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
