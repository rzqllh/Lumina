import { z } from 'zod';

export const sessionTypeEnum = z.enum([
  'shoot',
  'meeting',
  'pre_production',
  'event_day',
  'custom',
]);

export const sessionStatusEnum = z.enum(['scheduled', 'completed', 'cancelled']);

export const sessionFormSchema = z
  .object({
    type: sessionTypeEnum.default('shoot'),
    custom_type_label: z
      .string()
      .max(100, 'Custom label must be 100 characters or less')
      .optional(),
    title: z
      .string()
      .min(2, 'Session title must be at least 2 characters')
      .max(200, 'Title is too long'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a valid date (YYYY-MM-DD)'),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    location: z.string().max(300, 'Location must be 300 characters or less').optional(),
    notes: z.string().optional(),
    status: sessionStatusEnum.default('scheduled'),
  })
  .refine(
    (data) => {
      if (
        data.type === 'custom' &&
        (!data.custom_type_label || data.custom_type_label.trim().length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Please provide a custom label for custom session type',
      path: ['custom_type_label'],
    }
  );

export type SessionFormValues = z.infer<typeof sessionFormSchema>;
