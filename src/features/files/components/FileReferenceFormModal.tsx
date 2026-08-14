import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fileReferenceFormSchema, type FileReferenceFormValues } from '../schemas/fileSchemas';
import type { Deliverable } from '@/features/deliverables';
import { X, Link2 } from 'lucide-react';

interface FileReferenceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: FileReferenceFormValues) => Promise<void>;
  deliverables?: Deliverable[];
  defaultDeliverableId?: string | null;
  isPending?: boolean;
}

export const FileReferenceFormModal: React.FC<FileReferenceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  deliverables = [],
  defaultDeliverableId = null,
  isPending = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FileReferenceFormValues>({
    resolver: zodResolver(fileReferenceFormSchema),
    defaultValues: {
      provider: 'google_drive',
      display_name: '',
      url_or_path: '',
      deliverable_id: defaultDeliverableId,
      is_client_visible: true,
      notes: '',
    },
  });

  const selectedProvider = watch('provider');

  React.useEffect(() => {
    if (isOpen) {
      reset({
        provider: 'google_drive',
        display_name: '',
        url_or_path: '',
        deliverable_id: defaultDeliverableId,
        is_client_visible: true,
        notes: '',
      });
    }
  }, [isOpen, defaultDeliverableId, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div
        data-testid="file-reference-form-modal"
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              Attach External Media Link
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Connect Google Drive, Dropbox, or custom web galleries to this project
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Storage Provider *
              </label>
              <div className="relative">
                <select
                  data-testid="file-provider-select"
                  {...register('provider')}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="google_drive">Google Drive</option>
                  <option value="external_url">Dropbox / Web Gallery / URL</option>
                  <option value="app_storage">Lumina Cloud Storage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Link to Deliverable (Optional)
              </label>
              <select
                data-testid="file-deliverable-select"
                {...register('deliverable_id')}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">General Project Attachment</option>
                {deliverables.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label} ({d.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Display Name *
            </label>
            <input
              type="text"
              data-testid="file-name-input"
              {...register('display_name')}
              placeholder="e.g., Final High-Res Gallery, Highlight Video 4K Master"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.display_name && (
              <p className="text-[11px] text-destructive mt-1">{errors.display_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              External URL / Link *
            </label>
            <div className="relative">
              <input
                type="url"
                data-testid="file-url-input"
                {...register('url_or_path')}
                placeholder={
                  selectedProvider === 'google_drive'
                    ? 'https://drive.google.com/drive/folders/...'
                    : 'https://www.dropbox.com/sh/...'
                }
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {errors.url_or_path && (
              <p className="text-[11px] text-destructive mt-1">{errors.url_or_path.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Notes or Access Instructions (Optional)
            </label>
            <input
              type="text"
              data-testid="file-notes-input"
              {...register('notes')}
              placeholder="e.g., Password / PIN: 1234. Link expires in 6 months."
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_client_visible_chk"
              data-testid="file-client-visible-checkbox"
              {...register('is_client_visible')}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
            />
            <label
              htmlFor="is_client_visible_chk"
              className="text-xs font-semibold text-text-primary cursor-pointer"
            >
              Make visible on Client Portal (`/share/:token`)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              data-testid="submit-file-btn"
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Attaching...' : 'Attach Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
