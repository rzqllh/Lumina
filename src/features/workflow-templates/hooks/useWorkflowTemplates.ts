import { useQuery } from '@tanstack/react-query';
import { fetchWorkflowTemplates, fetchWorkflowTemplateById } from '../api/workflowTemplatesApi';

export const workflowTemplateKeys = {
  all: ['workflow-templates'] as const,
  lists: () => [...workflowTemplateKeys.all, 'list'] as const,
  list: (workspaceId: string, activeOnly?: boolean) =>
    [...workflowTemplateKeys.lists(), workspaceId, { activeOnly }] as const,
  details: () => [...workflowTemplateKeys.all, 'detail'] as const,
  detail: (workspaceId: string, templateId: string) =>
    [...workflowTemplateKeys.details(), workspaceId, templateId] as const,
};

export function useWorkflowTemplates(workspaceId: string, activeOnly?: boolean) {
  return useQuery({
    queryKey: workflowTemplateKeys.list(workspaceId, activeOnly),
    queryFn: () => fetchWorkflowTemplates(workspaceId, activeOnly),
    enabled: Boolean(workspaceId),
  });
}

export function useWorkflowTemplate(workspaceId: string, templateId: string) {
  return useQuery({
    queryKey: workflowTemplateKeys.detail(workspaceId, templateId),
    queryFn: () => fetchWorkflowTemplateById(workspaceId, templateId),
    enabled: Boolean(workspaceId && templateId),
  });
}
