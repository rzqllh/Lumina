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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-modal-title"
    >
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 id="task-form-modal-title" className="text-base font-bold text-neutral-100">
                {isEdit ? 'Edit Action Item' : 'New Action Item'}
              </h2>
              <p className="text-xs text-neutral-400">
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
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="task-form" onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-semibold text-neutral-200 mb-1"
            >
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              {...register('title')}
              placeholder="e.g. Send moodboard, Color grade reception batch..."
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stage Association */}
            <div>
              <label
                htmlFor="task-stage"
                className="block text-xs font-semibold text-neutral-300 mb-1"
              >
                Workflow Stage
              </label>
              <select
                id="task-stage"
                {...register('stage_id')}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
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
                className="block text-xs font-semibold text-neutral-300 mb-1"
              >
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                {...register('due_date')}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
              {errors.due_date && (
                <p className="mt-1 text-xs text-red-400">{errors.due_date.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="task-notes"
              className="block text-xs font-semibold text-neutral-300 mb-1"
            >
              Notes / Instructions <span className="text-neutral-500">(optional)</span>
            </label>
            <textarea
              id="task-notes"
              rows={3}
              {...register('notes')}
              placeholder="Additional details, asset links, or instructions..."
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
            {errors.notes && <p className="mt-1 text-xs text-red-400">{errors.notes.message}</p>}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-950/50 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEdit ? 'Save Task' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  );
};
