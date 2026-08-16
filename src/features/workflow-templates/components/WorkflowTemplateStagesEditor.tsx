import React from 'react';
import {
  type Control,
  useFieldArray,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import type { WorkflowTemplateFormData } from '../schemas/workflowTemplateSchemas';

interface WorkflowTemplateStagesEditorProps {
  control: Control<WorkflowTemplateFormData>;
  register: UseFormRegister<WorkflowTemplateFormData>;
  errors: FieldErrors<WorkflowTemplateFormData>;
  setValue: UseFormSetValue<WorkflowTemplateFormData>;
}

const COMMON_STAGE_PRESETS = [
  'Preparation & Briefing',
  'Pre-Production',
  'Shoot / Production Day',
  'Photo Culling & Selection',
  'Editing & Color Grading',
  'Client Review Loop',
  'Final Delivery & Gallery',
];

export const WorkflowTemplateStagesEditor: React.FC<WorkflowTemplateStagesEditorProps> = ({
  control,
  register,
  errors,
  setValue,
}) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'stages',
  });

  const handleAddStage = (label = '') => {
    append({
      label,
      position: fields.length,
    });
  };

  const handleApplyPresetGroup = () => {
    const defaultStages = [
      { label: 'Preparation & Briefing', position: 0 },
      { label: 'Shoot / Production Day', position: 1 },
      { label: 'Editing & Post-Production', position: 2 },
      { label: 'Final Delivery & Gallery', position: 3 },
    ];
    setValue('stages', defaultStages);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Workflow Stages <span className="text-status-danger-text">*</span>
          </label>
          <p className="text-xs text-text-secondary">
            Define the sequential stages for projects using this template.
          </p>
        </div>
        <button
          type="button"
          onClick={handleApplyPresetGroup}
          className="inline-flex cursor-pointer items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary-text bg-primary-subtle hover:bg-primary-subtle/80 border border-primary-border rounded-md transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
          Load Standard Preset
        </button>
      </div>

      {errors.stages?.root && (
        <p className="text-xs text-status-danger-text">{errors.stages.root.message}</p>
      )}
      {typeof errors.stages?.message === 'string' && (
        <p className="text-xs text-status-danger-text">{errors.stages.message}</p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => {
          const fieldError = errors.stages?.[index]?.label;

          return (
            <div
              key={field.id}
              className="flex items-center gap-2 p-2.5 bg-surface border border-border rounded-lg group hover:border-border-interactive transition-colors"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded bg-surface-muted text-xs font-mono font-medium text-text-secondary shrink-0 tabular-nums">
                {index + 1}
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  {...register(`stages.${index}.label`)}
                  placeholder="e.g. Pre-Production, Shoot, Editing..."
                  className="w-full px-3 py-1.5 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {fieldError && (
                  <p className="mt-1 text-xs text-status-danger-text">{fieldError.message}</p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label={`Move stage ${index + 1} up`}
                  className="p-1.5 text-text-muted hover:text-text-primary disabled:opacity-30 disabled:hover:text-text-muted rounded hover:bg-surface-muted cursor-pointer"
                >
                  <ArrowUp className="w-4 h-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label={`Move stage ${index + 1} down`}
                  className="p-1.5 text-text-muted hover:text-text-primary disabled:opacity-30 disabled:hover:text-text-muted rounded hover:bg-surface-muted cursor-pointer"
                >
                  <ArrowDown className="w-4 h-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}
                  aria-label={`Remove stage ${index + 1}`}
                  className="p-1.5 text-text-muted hover:text-status-danger-text disabled:opacity-30 disabled:hover:text-text-muted rounded hover:bg-status-danger-subtle cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={() => handleAddStage('')}
          className="inline-flex cursor-pointer items-center gap-1.5 px-3 py-2 text-xs font-semibold text-text-primary bg-surface border border-border hover:bg-surface-muted rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Stage
        </button>

        <div className="flex flex-wrap items-center gap-1.5 ml-auto">
          <span className="text-xs text-text-muted">Quick add:</span>
          {COMMON_STAGE_PRESETS.slice(0, 4).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleAddStage(preset)}
              className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary bg-surface border border-border hover:bg-surface-muted rounded transition-colors cursor-pointer"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
