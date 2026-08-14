import React, { useState } from 'react';
import { Workflow, Sparkles, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useProjectStages } from '../hooks/useProjectStages';
import { useWorkflowMutations } from '../hooks/useWorkflowMutations';
import { StagePipeline } from './StagePipeline';
import { StageManagerModal } from './StageManagerModal';
import { ApplyWorkflowTemplateModal } from './ApplyWorkflowTemplateModal';
import type { StageStatus } from '../types';

interface ProjectWorkflowSectionProps {
  workspaceId: string;
  projectId: string;
  isForceClosed?: boolean;
  selectedStageId?: string | null;
  onSelectStage?: (stageId: string | null) => void;
}

export const ProjectWorkflowSection: React.FC<ProjectWorkflowSectionProps> = ({
  workspaceId,
  projectId,
  isForceClosed = false,
  selectedStageId,
  onSelectStage,
}) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [updatingStageId, setUpdatingStageId] = useState<string | null>(null);

  const { data: stages = [], isLoading, error } = useProjectStages(workspaceId, projectId);

  const {
    createStage,
    updateStage,
    updateStatus,
    reorderStages,
    deleteStage,
    applyTemplate,
    isApplyingTemplate,
  } = useWorkflowMutations();

  const handleStatusChange = async (stageId: string, status: StageStatus) => {
    setUpdatingStageId(stageId);
    try {
      await updateStatus({
        workspaceId,
        projectId,
        stageId,
        status,
      });
    } finally {
      setUpdatingStageId(null);
    }
  };

  const handleApplyTemplate = async (templateId: string, mode: 'replace' | 'append') => {
    await applyTemplate({
      workspaceId,
      projectId,
      templateId,
      mode,
    });
  };

  const handleCreateCustomStage = async (label: string) => {
    await createStage({
      workspace_id: workspaceId,
      project_id: projectId,
      label,
    });
  };

  const handleUpdateCustomStage = async (stageId: string, label: string) => {
    await updateStage({
      workspaceId,
      projectId,
      stageId,
      input: { label },
    });
  };

  const handleReorderStages = async (stageOrders: { id: string; position: number }[]) => {
    await reorderStages({
      workspaceId,
      projectId,
      stageOrders,
    });
  };

  const handleDeleteStage = async (stageId: string) => {
    await deleteStage({
      workspaceId,
      projectId,
      stageId,
    });
  };

  return (
    <section aria-labelledby="project-workflow-heading" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <h3 id="project-workflow-heading" className="text-base font-bold text-neutral-100">
              Production Workflow
            </h3>
            <p className="text-xs text-neutral-400">
              Project production stages and current progress.
            </p>
          </div>
        </div>

        {!isForceClosed && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {stages.length > 0 ? 'Apply Template' : 'Apply Workflow'}
            </button>

            {stages.length > 0 && (
              <button
                type="button"
                onClick={() => setIsManagerModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-neutral-100 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Customize
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex items-center justify-center py-10 text-neutral-400 bg-neutral-900/40 border border-neutral-800 rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading workflow stages...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
          Failed to load project workflow stages. Please try refreshing.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && stages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-4 bg-neutral-900/30 border border-neutral-800 border-dashed rounded-xl text-center">
          <Workflow className="w-8 h-8 text-neutral-600 mb-2" />
          <h4 className="text-sm font-semibold text-neutral-200 mb-1">
            No workflow stages added yet
          </h4>
          <p className="text-xs text-neutral-400 max-w-sm mb-4">
            Apply a preset workflow template from your catalog or add custom stages to track
            production.
          </p>
          {!isForceClosed && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Apply Workflow Template
              </button>
              <button
                type="button"
                onClick={() => setIsManagerModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors"
              >
                Add Custom Stage
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Pipeline */}
      {!isLoading && !error && stages.length > 0 && (
        <StagePipeline
          stages={stages}
          onStatusChange={handleStatusChange}
          selectedStageId={selectedStageId}
          onSelectStage={onSelectStage}
          updatingStageId={updatingStageId}
          disabled={isForceClosed}
        />
      )}

      {/* Apply Workflow Template Modal */}
      <ApplyWorkflowTemplateModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        workspaceId={workspaceId}
        projectId={projectId}
        hasExistingStages={stages.length > 0}
        onApply={handleApplyTemplate}
        isApplying={isApplyingTemplate}
      />

      {/* Customize Stages Modal */}
      <StageManagerModal
        isOpen={isManagerModalOpen}
        onClose={() => setIsManagerModalOpen(false)}
        stages={stages}
        onCreateStage={handleCreateCustomStage}
        onUpdateStage={handleUpdateCustomStage}
        onReorderStages={handleReorderStages}
        onDeleteStage={handleDeleteStage}
        disabled={isForceClosed}
      />
    </section>
  );
};
