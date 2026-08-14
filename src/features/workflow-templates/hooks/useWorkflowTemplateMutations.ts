import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createWorkflowTemplate,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
  duplicateWorkflowTemplate,
} from '../api/workflowTemplatesApi';
import { workflowTemplateKeys } from './useWorkflowTemplates';
import type {
  CreateWorkflowTemplateInput,
  UpdateWorkflowTemplateInput,
} from '../types/workflowTemplateTypes';

export function useWorkflowTemplateMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: CreateWorkflowTemplateInput) => createWorkflowTemplate(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workflowTemplateKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: workflowTemplateKeys.list(variables.workspace_id),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      workspaceId,
      templateId,
      input,
    }: {
      workspaceId: string;
      templateId: string;
      input: UpdateWorkflowTemplateInput;
    }) => updateWorkflowTemplate(workspaceId, templateId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workflowTemplateKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: workflowTemplateKeys.detail(variables.workspaceId, variables.templateId),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ workspaceId, templateId }: { workspaceId: string; templateId: string }) =>
      deleteWorkflowTemplate(workspaceId, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowTemplateKeys.lists(),
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: ({ workspaceId, templateId }: { workspaceId: string; templateId: string }) =>
      duplicateWorkflowTemplate(workspaceId, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowTemplateKeys.lists(),
      });
    },
  });

  return {
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
    duplicateTemplate: duplicateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  };
}
