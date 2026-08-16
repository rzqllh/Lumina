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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workflow-template-modal-title"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-surface border border-border rounded-xl shadow-sheet overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2
              id="workflow-template-modal-title"
              className="text-base font-semibold text-text-primary"
            >
              {title || (isEdit ? 'Edit Workflow Template' : 'New Workflow Template')}
            </h2>
            <p className="text-xs text-text-secondary">
              {isEdit
                ? 'Update reusable stages and template metadata.'
                : 'Define reusable production stages for projects.'}
            </p>
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
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1"
              >
                Template Name <span className="text-status-danger-text">*</span>
              </label>
              <input
                id="template-name"
                type="text"
                {...register('name')}
                placeholder="e.g. Standard Wedding, Corporate Video..."
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-status-danger-text">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="template-description"
                className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1"
              >
                Description <span className="text-xs font-normal text-text-muted">(optional)</span>
              </label>
              <textarea
                id="template-description"
                rows={2}
                {...register('description')}
                placeholder="Brief description of when this workflow should be applied..."
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-status-danger-text">{errors.description.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="template-active"
                type="checkbox"
                {...register('is_active')}
                className="w-4 h-4 rounded border-border text-primary focus:ring-ring"
              />
              <label
                htmlFor="template-active"
                className="text-xs font-medium text-text-secondary cursor-pointer"
              >
                Active (available to apply in projects)
              </label>
            </div>
          </div>

          <hr className="border-border-subtle" />

          {/* Stages Editor */}
          <WorkflowTemplateStagesEditor
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
          />
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surface-muted/30 border-t border-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="workflow-template-form"
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-lg transition-colors shadow-subtle"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );
};
