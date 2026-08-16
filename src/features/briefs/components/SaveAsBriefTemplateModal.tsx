import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { briefTemplateFormSchema, type BriefTemplateFormValues } from '../schemas/briefSchemas';
import { X, BookmarkPlus } from 'lucide-react';

interface SaveAsBriefTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: BriefTemplateFormValues) => Promise<void>;
  defaultName?: string;
  isPending?: boolean;
}

export const SaveAsBriefTemplateModal: React.FC<SaveAsBriefTemplateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultName = '',
  isPending = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BriefTemplateFormValues>({
    resolver: zodResolver(briefTemplateFormSchema),
    defaultValues: {
      name: defaultName,
      description: '',
      is_active: true,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: defaultName,
        description: '',
        is_active: true,
      });
    }
  }, [isOpen, defaultName, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
      <div
        data-testid="save-as-brief-template-modal"
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sheet space-y-5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary-text border border-primary-border">
              <BookmarkPlus className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Save as Brief Template</h2>
              <p className="text-xs text-text-secondary">
                Store this questionnaire structure to your workspace catalog.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Template Name <span className="text-status-danger-text">*</span>
            </label>
            <input
              type="text"
              data-testid="template-name-input"
              {...register('name')}
              placeholder="e.g., Wedding Client Questionnaire, Commercial Intake"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.name && (
              <p className="text-xs text-status-danger-text mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              data-testid="template-description-input"
              {...register('description')}
              placeholder="e.g., Standard questions for full-day wedding shoots including timeline, family VIPs, and moodboard."
              className="w-full rounded-lg border border-border bg-surface p-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              data-testid="confirm-save-template-btn"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
