import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { briefFieldFormSchema, type BriefFieldFormValues } from '../schemas/briefSchemas';
import type { BriefField } from '../types';
import { X, Sparkles } from 'lucide-react';

interface BriefFieldFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: BriefFieldFormValues) => Promise<void>;
  fieldToEdit?: BriefField | null;
  sectionTitle?: string;
  isPending?: boolean;
}

export const BriefFieldFormModal: React.FC<BriefFieldFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  fieldToEdit,
  sectionTitle,
  isPending = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BriefFieldFormValues>({
    resolver: zodResolver(briefFieldFormSchema),
    defaultValues: {
      field_type: fieldToEdit?.field_type || 'short_text',
      label: fieldToEdit?.label || '',
      helper_text: fieldToEdit?.helper_text || '',
      is_required: fieldToEdit?.is_required || false,
      visibility: fieldToEdit?.visibility || 'client_can_fill',
      value: fieldToEdit?.value || '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        field_type: fieldToEdit?.field_type || 'short_text',
        label: fieldToEdit?.label || '',
        helper_text: fieldToEdit?.helper_text || '',
        is_required: fieldToEdit?.is_required || false,
        visibility: fieldToEdit?.visibility || 'client_can_fill',
        value: fieldToEdit?.value || '',
      });
    }
  }, [isOpen, fieldToEdit, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
      <div
        data-testid="brief-field-form-modal"
        className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-sheet space-y-5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary-text border border-primary-border">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                {fieldToEdit ? 'Edit Brief Question' : 'Add Question to Brief'}
              </h2>
              {sectionTitle && (
                <p className="text-xs text-text-secondary">Section: {sectionTitle}</p>
              )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Question Type <span className="text-status-danger-text">*</span>
              </label>
              <select
                data-testid="field-type-select"
                {...register('field_type')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="short_text">Short Text (Single Line)</option>
                <option value="long_text">Long Text (Multi-Line)</option>
                <option value="rich_text">Rich Description</option>
                <option value="date">Date</option>
                <option value="time">Time</option>
                <option value="number">Number</option>
                <option value="location">Location / Address</option>
                <option value="url">Web Link (Pinterest / Drive)</option>
                <option value="checkbox">Checkbox (Yes / No)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Client Visibility <span className="text-status-danger-text">*</span>
              </label>
              <select
                data-testid="field-visibility-select"
                {...register('visibility')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="client_can_fill">Client Can Fill (Optional)</option>
                <option value="client_must_fill">Client Must Fill (Required in Intake)</option>
                <option value="client_can_view">Client View Only (Read-Only)</option>
                <option value="internal_only">Internal Only (Crew/Studio Eyes)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Question / Field Label <span className="text-status-danger-text">*</span>
            </label>
            <input
              type="text"
              data-testid="field-label-input"
              {...register('label')}
              placeholder="e.g., Target Aesthetic, Preferred Call Time, Shot List"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.label && (
              <p className="text-xs text-status-danger-text mt-1">{errors.label.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Instructions or Helper Note
            </label>
            <input
              type="text"
              data-testid="field-helper-input"
              {...register('helper_text')}
              placeholder="e.g., Provide link to your Pinterest board or Instagram moodboard"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Current / Initial Value
            </label>
            <input
              type="text"
              data-testid="field-value-input"
              {...register('value')}
              placeholder="Enter value or leave empty for client intake"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_required_chk"
              data-testid="field-required-checkbox"
              {...register('is_required')}
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
            />
            <label
              htmlFor="is_required_chk"
              className="text-xs font-medium text-text-primary cursor-pointer"
            >
              Mark as required field
            </label>
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
              data-testid="field-submit-btn"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Saving...' : fieldToEdit ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
