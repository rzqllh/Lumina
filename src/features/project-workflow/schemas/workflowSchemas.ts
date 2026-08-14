import { z } from 'zod';

export const stageStatusSchema = z.enum(['not_started', 'active', 'completed', 'skipped']);

export const projectStageFormSchema = z.object({
  label: z.string().trim().min(1, 'Stage label is required').max(100, 'Stage label is too long'),
  status: stageStatusSchema.default('not_started'),
});

export type ProjectStageFormData = z.infer<typeof projectStageFormSchema>;

export const applyWorkflowTemplateSchema = z.object({
  template_id: z.string().uuid('Please select a valid workflow template'),
  mode: z.enum(['replace', 'append']).default('append'),
});

export type ApplyWorkflowTemplateFormData = z.infer<typeof applyWorkflowTemplateSchema>;

export const taskStatusSchema = z.enum(['open', 'done']);

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').max(250, 'Task title is too long'),
  stage_id: z.string().uuid().nullable().optional(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .nullable()
    .optional()
    .or(z.literal('')),
  notes: z.string().trim().max(1000, 'Notes too long').nullable().optional(),
  status: taskStatusSchema.default('open'),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
