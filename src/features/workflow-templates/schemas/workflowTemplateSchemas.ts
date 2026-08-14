import { z } from 'zod';

export const workflowTemplateStageSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1, 'Stage label is required').max(100, 'Stage label is too long'),
  position: z.number().int().min(0, 'Position must be non-negative'),
});

export const workflowTemplateFormSchema = z.object({
  name: z.string().trim().min(1, 'Template name is required').max(100, 'Template name is too long'),
  description: z.string().trim().max(500, 'Description is too long').nullable().optional(),
  is_active: z.boolean().default(true),
  stages: z
    .array(workflowTemplateStageSchema)
    .min(1, 'At least one stage is required in a workflow template'),
});

export type WorkflowTemplateFormData = z.infer<typeof workflowTemplateFormSchema>;
