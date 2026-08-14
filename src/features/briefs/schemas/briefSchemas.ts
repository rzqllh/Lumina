import { z } from 'zod';

export const briefFieldTypeEnum = z.enum([
  'short_text',
  'long_text',
  'rich_text',
  'number',
  'date',
  'time',
  'datetime',
  'single_select',
  'multi_select',
  'checkbox',
  'checklist',
  'location',
  'url',
  'file_reference',
  'schedule_timeline',
]);

export const briefFieldVisibilityEnum = z.enum([
  'internal_only',
  'client_can_view',
  'client_can_fill',
  'client_must_fill',
]);

export const briefSectionFormSchema = z.object({
  label: z.string().min(2, 'Section title must be at least 2 characters').max(100),
  instruction_text: z.string().max(500).optional().or(z.literal('')),
});

export type BriefSectionFormValues = z.infer<typeof briefSectionFormSchema>;

export const briefFieldFormSchema = z.object({
  field_type: briefFieldTypeEnum.default('short_text'),
  label: z.string().min(2, 'Field label must be at least 2 characters').max(100),
  helper_text: z.string().max(300).optional().or(z.literal('')),
  is_required: z.boolean().default(false),
  visibility: briefFieldVisibilityEnum.default('client_can_fill'),
  value: z.any().optional(),
});

export type BriefFieldFormValues = z.infer<typeof briefFieldFormSchema>;

export const briefTemplateFormSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters').max(100),
  description: z.string().max(300).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

export type BriefTemplateFormValues = z.infer<typeof briefTemplateFormSchema>;
