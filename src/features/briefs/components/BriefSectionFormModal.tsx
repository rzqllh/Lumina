import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { briefSectionFormSchema, type BriefSectionFormValues } from '../schemas/briefSchemas';
import type { BriefSection } from '../types';
import { X, FolderPlus } from 'lucide-react';

interface BriefSectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: BriefSectionFormValues) => Promise<void>;
  sectionToEdit?: BriefSection | null;
  isPending?: boolean;
}

export const BriefSectionFormModal: React.FC<BriefSectionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sectionToEdit,
  isPending = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BriefSectionFormValues>({
    resolver: zodResolver(briefSectionFormSchema),
    defaultValues: {
      label: sectionToEdit?.label || '',
      instruction_text: sectionToEdit?.instruction_text || '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        label: sectionToEdit?.label || '',
        instruction_text: sectionToEdit?.instruction_text || '',
      });
    }
  }, [isOpen, sectionToEdit, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
      <div
        data-testid="brief-section-form-modal"
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sheet space-y-5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary-text border border-primary-border">
              <FolderPlus className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                {sectionToEdit ? 'Edit Brief Section' : 'Add Section to Brief'}
              </h2>
              <p className="text-xs text-text-secondary">
                Organize questionnaire topics into groups.
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
              Section Title <span className="text-status-danger-text">*</span>
            </label>
            <input
              type="text"
              data-testid="section-label-input"
              {...register('label')}
              placeholder="e.g., Creative Direction, Logistics & Location, Run of Show"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.label && (
              <p className="text-xs text-status-danger-text mt-1">{errors.label.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Section Instructions (Optional)
            </label>
            <textarea
              rows={3}
              data-testid="section-instructions-input"
              {...register('instruction_text')}
              placeholder="e.g., Please outline your aesthetic preferences and moodboard links below."
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
              data-testid="section-submit-btn"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Saving...' : sectionToEdit ? 'Update Section' : 'Add Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
