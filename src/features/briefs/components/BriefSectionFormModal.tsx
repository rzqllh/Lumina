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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div
        data-testid="brief-section-form-modal"
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <FolderPlus className="h-4 w-4 text-primary" />
            {sectionToEdit ? 'Edit Brief Section' : 'Add Section to Brief'}
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
              Section Title *
            </label>
            <input
              type="text"
              data-testid="section-label-input"
              {...register('label')}
              placeholder="e.g., Creative Direction, Logistics & Location, Run of Show"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.label && (
              <p className="text-[11px] text-destructive mt-1">{errors.label.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Section Instructions (Optional)
            </label>
            <textarea
              rows={3}
              data-testid="section-instructions-input"
              {...register('instruction_text')}
              placeholder="e.g., Please outline your aesthetic preferences and moodboard links below."
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
              data-testid="section-submit-btn"
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Saving...' : sectionToEdit ? 'Update Section' : 'Add Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
