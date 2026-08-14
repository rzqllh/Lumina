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
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-neutral-200">
            Workflow Stages <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-neutral-400">
            Define the sequential stages for projects using this template.
          </p>
        </div>
        <button
          type="button"
          onClick={handleApplyPresetGroup}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-md transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Standard Preset
        </button>
      </div>

      {errors.stages?.root && <p className="text-xs text-red-400">{errors.stages.root.message}</p>}
      {typeof errors.stages?.message === 'string' && (
        <p className="text-xs text-red-400">{errors.stages.message}</p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => {
          const fieldError = errors.stages?.[index]?.label;

          return (
            <div
              key={field.id}
              className="flex items-center gap-2 p-2.5 bg-neutral-900/60 border border-neutral-800 rounded-lg group hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded bg-neutral-800 text-xs font-mono font-medium text-neutral-400 shrink-0">
                {index + 1}
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  {...register(`stages.${index}.label`)}
                  placeholder="e.g. Pre-Production, Shoot, Editing..."
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50"
                />
                {fieldError && <p className="mt-1 text-xs text-red-400">{fieldError.message}</p>}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label={`Move stage ${index + 1} up`}
                  className="p-1.5 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 disabled:hover:text-neutral-400 rounded hover:bg-neutral-800"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label={`Move stage ${index + 1} down`}
                  className="p-1.5 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 disabled:hover:text-neutral-400 rounded hover:bg-neutral-800"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}
                  aria-label={`Remove stage ${index + 1}`}
                  className="p-1.5 text-neutral-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-neutral-500 rounded hover:bg-neutral-800"
                >
                  <Trash2 className="w-4 h-4" />
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
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Stage
        </button>

        <div className="flex flex-wrap items-center gap-1.5 ml-auto">
          <span className="text-xs text-neutral-400">Quick add:</span>
          {COMMON_STAGE_PRESETS.slice(0, 4).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleAddStage(preset)}
              className="px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded transition-colors"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
