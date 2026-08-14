import { z } from 'zod';

export const fileProviderEnum = z.enum(['google_drive', 'external_url', 'app_storage']);

export const fileReferenceFormSchema = z.object({
  provider: fileProviderEnum.default('google_drive'),
  display_name: z.string().min(2, 'File label must be at least 2 characters').max(120),
  url_or_path: z.string().url('Please enter a valid URL (e.g. Google Drive / Dropbox link)'),
  deliverable_id: z.string().uuid().nullable().optional(),
  is_client_visible: z.boolean().default(true),
  notes: z.string().max(300).optional().or(z.literal('')),
});

export type FileReferenceFormValues = z.infer<typeof fileReferenceFormSchema>;
