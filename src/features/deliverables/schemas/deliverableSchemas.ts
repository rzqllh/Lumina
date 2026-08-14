import { z } from 'zod';

export const deliverableStatusEnum = z.enum([
  'planned',
  'in_progress',
  'delivered',
  'awaiting_review',
  'approved',
  'revision_requested',
]);

export const deliverableFormSchema = z.object({
  label: z
    .string()
    .min(2, 'Deliverable title must be at least 2 characters')
    .max(200, 'Title is too long'),
  quantity: z
    .union([z.number().int().positive('Quantity must be greater than 0'), z.nan()])
    .optional()
    .nullable(),
  type_label: z.string().max(100, 'Type category must be 100 characters or less').optional(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a valid date (YYYY-MM-DD)')
    .optional()
    .or(z.literal('')),
  status: deliverableStatusEnum.default('planned'),
  notes: z.string().optional(),
});

export type DeliverableFormValues = z.infer<typeof deliverableFormSchema>;
