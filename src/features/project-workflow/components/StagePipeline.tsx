import React from 'react';
import { StageCard } from './StageCard';
import type { ProjectWorkflowStage, StageStatus } from '../types';

interface StagePipelineProps {
  stages: ProjectWorkflowStage[];
  onStatusChange: (stageId: string, status: StageStatus) => Promise<void>;
  selectedStageId?: string | null;
  onSelectStage?: (stageId: string | null) => void;
  updatingStageId?: string | null;
  disabled?: boolean;
}

export const StagePipeline: React.FC<StagePipelineProps> = ({
  stages,
  onStatusChange,
  selectedStageId,
  onSelectStage,
  updatingStageId,
  disabled = false,
}) => {
  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const activeCount = stages.filter((s) => s.status === 'active').length;
  const total = stages.length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progression Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-text-primary">
            Progress: {completedCount}/{total} completed ({progressPercent}%)
          </span>
          {activeCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              {activeCount} Active
            </span>
          )}
        </div>

        {selectedStageId && (
          <button
            type="button"
            onClick={() => onSelectStage?.(null)}
            className="text-xs font-semibold text-primary hover:underline self-start sm:self-auto cursor-pointer"
          >
            Clear stage filter
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-surface-muted border border-border rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Responsive Stages Pipeline Grid / Horizontal Scroller */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stages.map((stage, idx) => (
          <StageCard
            key={stage.id}
            stage={stage}
            index={idx}
            onStatusChange={(status) => onStatusChange(stage.id, status)}
            isUpdating={updatingStageId === stage.id}
            disabled={disabled}
            isSelected={selectedStageId === stage.id}
            onSelectStage={() => onSelectStage?.(selectedStageId === stage.id ? null : stage.id)}
          />
        ))}
      </div>
    </div>
  );
};
