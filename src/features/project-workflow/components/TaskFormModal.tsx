import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2, CheckSquare } from 'lucide-react';
import { taskFormSchema, type TaskFormData } from '../schemas/workflowSchemas';
import type { Task, ProjectWorkflowStage } from '../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  stages: ProjectWorkflowStage[];
  initialData?: Task | null;
  defaultStageId?: string | null;
  isSubmitting?: boolean;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  stages,
  initialData,
  defaultStageId,
  isSubmitting = false,
}) => {
  const isEdit = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      stage_id: initialData?.stage_id || defaultStageId || null,
      due_date: initialData?.due_date || '',
      notes: initialData?.notes || '',
      status: initialData?.status || 'open',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          stage_id: initialData.stage_id || null,
          due_date: initialData.due_date || '',
          notes: initialData.notes || '',
          status: initialData.status,
        });
      } else {
        reset({
          title: '',
          stage_id: defaultStageId || null,
          due_date: '',
          notes: '',
          status: 'open',
        });
      }
    }
  }, [isOpen, initialData, defaultStageId, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: TaskFormData) => {
    await onSubmit({
      ...data,
      stage_id: data.stage_id ? data.stage_id : null,
      due_date: data.due_date ? data.due_date : null,
      notes: data.notes ? data.notes : null,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-modal-title"
    >
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-sheet overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-subtle border border-primary-border flex items-center justify-center text-primary-text">
              <CheckSquare className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 id="task-form-modal-title" className="text-base font-semibold text-text-primary">
                {isEdit ? 'Edit Action Item' : 'New Action Item'}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEdit
                  ? 'Update task requirements and deadlines.'
                  : 'Add a task to keep production moving.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Form Body */}
        <form id="task-form" onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="task-title"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1"
            >
              Task Title <span className="text-status-danger-text">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              {...register('title')}
              placeholder="e.g. Send moodboard, Color grade reception batch..."
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-status-danger-text">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stage Association */}
            <div>
              <label
                htmlFor="task-stage"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1"
              >
                Workflow Stage
              </label>
              <select
                id="task-stage"
                {...register('stage_id')}
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">(Unassigned / General)</option>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="task-due-date"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1"
              >
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                {...register('due_date')}
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.due_date && (
                <p className="mt-1 text-xs text-status-danger-text">{errors.due_date.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="task-notes"
              className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1"
            >
              Notes / Instructions{' '}
              <span className="text-text-muted font-normal lowercase">(optional)</span>
            </label>
            <textarea
              id="task-notes"
              rows={3}
              {...register('notes')}
              placeholder="Additional details, asset links, or instructions..."
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.notes && (
              <p className="mt-1 text-xs text-status-danger-text">{errors.notes.message}</p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surface-muted/30 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-form"
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-lg transition-colors shadow-subtle"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEdit ? 'Save Task' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  );
};
