import { z } from 'zod';

export const revisionStatusEnum = z.enum([
  'requested',
  'in_progress',
  'delivered',
  'awaiting_review',
  'approved',
  'changes_requested',
]);

export const revisionFormSchema = z.object({
  feedback: z
    .string()
    .min(5, 'Client feedback must be at least 5 characters')
    .max(2000, 'Feedback is too long'),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a valid date (YYYY-MM-DD)')
    .optional()
    .or(z.literal('')),
  notes: z.string().optional(),
});

export type RevisionFormValues = z.infer<typeof revisionFormSchema>;
