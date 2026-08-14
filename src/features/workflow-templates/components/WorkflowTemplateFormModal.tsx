import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';
import {
  workflowTemplateFormSchema,
  type WorkflowTemplateFormData,
} from '../schemas/workflowTemplateSchemas';
import { WorkflowTemplateStagesEditor } from './WorkflowTemplateStagesEditor';
import type { WorkflowTemplateWithStages } from '../types/workflowTemplateTypes';

interface WorkflowTemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkflowTemplateFormData) => Promise<void>;
  initialData?: WorkflowTemplateWithStages | null;
  isSubmitting?: boolean;
  title?: string;
}

export const WorkflowTemplateFormModal: React.FC<WorkflowTemplateFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
  title,
}) => {
  const isEdit = Boolean(initialData);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<WorkflowTemplateFormData>({
    resolver: zodResolver(workflowTemplateFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      is_active: initialData?.is_active ?? true,
      stages:
        initialData?.workflow_template_stages && initialData.workflow_template_stages.length > 0
          ? initialData.workflow_template_stages.map((s, idx) => ({
              id: s.id,
              label: s.label,
              position: s.position ?? idx,
            }))
          : [
              { label: 'Preparation & Briefing', position: 0 },
              { label: 'Production / Shoot', position: 1 },
              { label: 'Editing & Post-Production', position: 2 },
              { label: 'Final Delivery & Gallery', position: 3 },
            ],
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description || '',
          is_active: initialData.is_active,
          stages: initialData.workflow_template_stages.map((s, idx) => ({
            id: s.id,
            label: s.label,
            position: s.position ?? idx,
          })),
        });
      } else {
        reset({
          name: '',
          description: '',
          is_active: true,
          stages: [
            { label: 'Preparation & Briefing', position: 0 },
            { label: 'Production / Shoot', position: 1 },
            { label: 'Editing & Post-Production', position: 2 },
            { label: 'Final Delivery & Gallery', position: 3 },
          ],
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: WorkflowTemplateFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workflow-template-modal-title"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
          <div>
            <h2 id="workflow-template-modal-title" className="text-lg font-bold text-neutral-100">
              {title || (isEdit ? 'Edit Workflow Template' : 'New Workflow Template')}
            </h2>
            <p className="text-xs text-neutral-400">
              {isEdit
                ? 'Update reusable stages and template metadata.'
                : 'Define reusable production stages for projects.'}
            </p>
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

        {/* Body */}
        <form
          id="workflow-template-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="template-name"
                className="block text-sm font-semibold text-neutral-200 mb-1"
              >
                Template Name <span className="text-red-400">*</span>
              </label>
              <input
                id="template-name"
                type="text"
                {...register('name')}
                placeholder="e.g. Standard Wedding, Corporate Video..."
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50"
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label
                htmlFor="template-description"
                className="block text-sm font-semibold text-neutral-200 mb-1"
              >
                Description <span className="text-xs font-normal text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="template-description"
                rows={2}
                {...register('description')}
                placeholder="Brief description of when this workflow should be applied..."
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="template-active"
                type="checkbox"
                {...register('is_active')}
                className="w-4 h-4 rounded bg-neutral-950 border-neutral-800 text-amber-500 focus:ring-amber-500/30"
              />
              <label
                htmlFor="template-active"
                className="text-sm font-medium text-neutral-300 cursor-pointer"
              >
                Active (available to apply in projects)
              </label>
            </div>
          </div>

          <hr className="border-neutral-800" />

          {/* Stages Editor */}
          <WorkflowTemplateStagesEditor
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
          />
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-950/50 border-t border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="workflow-template-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:hover:bg-amber-400 rounded-lg transition-colors shadow-sm"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );
};
