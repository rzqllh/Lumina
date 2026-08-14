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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div
        data-testid="save-as-brief-template-modal"
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <BookmarkPlus className="h-4 w-4 text-primary" />
            Save as Brief Template
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Template Name *
            </label>
            <input
              type="text"
              data-testid="template-name-input"
              {...register('name')}
              placeholder="e.g., Wedding Client Questionnaire, Commercial Intake"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              data-testid="template-description-input"
              {...register('description')}
              placeholder="e.g., Standard questions for full-day wedding shoots including timeline, family VIPs, and moodboard."
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
            />
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
              data-testid="confirm-save-template-btn"
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
