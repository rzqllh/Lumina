import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createProjectStage,
  updateProjectStage,
  updateStageStatus,
  reorderProjectStages,
  deleteProjectStage,
  applyWorkflowTemplate,
} from '../api/projectStagesApi';
import { projectWorkflowKeys } from './useProjectStages';
import type { CreateProjectStageInput, UpdateProjectStageInput, StageStatus } from '../types';

export function useWorkflowMutations() {
  const queryClient = useQueryClient();

  const createStageMutation = useMutation({
    mutationFn: (input: CreateProjectStageInput) => createProjectStage(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorkflowKeys.stages(variables.workspace_id, variables.project_id),
      });
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      stageId,
      input,
    }: {
      workspaceId: string;
      projectId: string;
      stageId: string;
      input: UpdateProjectStageInput;
    }) => updateProjectStage(workspaceId, projectId, stageId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorkflowKeys.stages(variables.workspaceId, variables.projectId),
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      stageId,
      status,
    }: {
      workspaceId: string;
      projectId: string;
      stageId: string;
      status: StageStatus;
    }) => updateStageStatus(workspaceId, projectId, stageId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorkflowKeys.stages(variables.workspaceId, variables.projectId),
      });
    },
  });

  const reorderStagesMutation = useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      stageOrders,
    }: {
      workspaceId: string;
      projectId: string;
      stageOrders: { id: string; position: number }[];
    }) => reorderProjectStages(workspaceId, projectId, stageOrders),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorkflowKeys.stages(variables.workspaceId, variables.projectId),
      });
    },
  });

  const deleteStageMutation = useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      stageId,
    }: {
      workspaceId: string;
      projectId: string;
      stageId: string;
    }) => deleteProjectStage(workspaceId, projectId, stageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorkflowKeys.stages(variables.workspaceId, variables.projectId),
      });
      // Invalidate tasks as foreign key was set to null
      queryClient.invalidateQueries({
        queryKey: projectWorkflowKeys.tasks(variables.workspaceId, variables.projectId),
      });
    },
  });

  const applyTemplateMutation = useMutation({
    mutationFn: ({
      workspaceId: _workspaceId,
      projectId,
      templateId,
      mode,
    }: {
      workspaceId: string;
      projectId: string;
      templateId: string;
      mode: 'replace' | 'append';
    }) => applyWorkflowTemplate(projectId, templateId, mode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectWorkflowKeys.stages(variables.workspaceId, variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectWorkflowKeys.tasks(variables.workspaceId, variables.projectId),
      });
    },
  });

  return {
    createStage: createStageMutation.mutateAsync,
    updateStage: updateStageMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    reorderStages: reorderStagesMutation.mutateAsync,
    deleteStage: deleteStageMutation.mutateAsync,
    applyTemplate: applyTemplateMutation.mutateAsync,
    isCreatingStage: createStageMutation.isPending,
    isUpdatingStage: updateStageMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isReorderingStages: reorderStagesMutation.isPending,
    isDeletingStage: deleteStageMutation.isPending,
    isApplyingTemplate: applyTemplateMutation.isPending,
  };
}
