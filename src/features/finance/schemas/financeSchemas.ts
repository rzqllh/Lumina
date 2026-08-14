import { z } from 'zod';

export const paymentTypeEnum = z.enum(['dp', 'installment', 'final', 'other']);
export const paymentStatusEnum = z.enum(['pending', 'paid']);

export const paymentFormSchema = z.object({
  type: paymentTypeEnum.default('installment'),
  label: z.string().max(100, 'Label is too long').optional().or(z.literal('')),
  amount: z.coerce
    .number()
    .int('Amount must be an integer')
    .positive('Amount must be greater than 0'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a valid date (YYYY-MM-DD)'),
  status: paymentStatusEnum.default('pending'),
  paid_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a valid date (YYYY-MM-DD)')
    .optional()
    .or(z.literal('')),
  payment_method: z.string().max(50).optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export const expenseFormSchema = z.object({
  label: z.string().min(2, 'Expense label must be at least 2 characters').max(150),
  amount: z.coerce
    .number()
    .int('Amount must be an integer')
    .nonnegative('Amount cannot be negative'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a valid date (YYYY-MM-DD)'),
  category: z.string().max(50).optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export const collaboratorEngagementFormSchema = z.object({
  collaborator_id: z.string().uuid('Please select a collaborator'),
  role_label: z.string().min(2, 'Role label must be at least 2 characters').max(100),
  agreed_fee: z.coerce
    .number()
    .int('Fee must be an integer')
    .nonnegative('Agreed fee cannot be negative'),
  payment_status: z.enum(['unpaid', 'partial', 'paid']).default('unpaid'),
  paid_amount: z.coerce
    .number()
    .int('Paid amount must be an integer')
    .nonnegative('Paid amount cannot be negative')
    .default(0),
  notes: z.string().optional(),
});

export type CollaboratorEngagementFormValues = z.infer<typeof collaboratorEngagementFormSchema>;

export const collaboratorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  specialty: z.string().max(100).optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type CollaboratorFormValues = z.infer<typeof collaboratorFormSchema>;

export const forceCloseFormSchema = z.object({
  reason: z
    .string()
    .min(5, 'Force-close reason must be at least 5 characters')
    .max(500, 'Reason is too long'),
});

export type ForceCloseFormValues = z.infer<typeof forceCloseFormSchema>;
