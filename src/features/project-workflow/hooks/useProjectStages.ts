import { useQuery } from '@tanstack/react-query';
import { fetchProjectStages } from '../api/projectStagesApi';

export const projectWorkflowKeys = {
  all: ['project-workflow'] as const,
  stages: (workspaceId: string, projectId: string) =>
    [...projectWorkflowKeys.all, 'stages', workspaceId, projectId] as const,
  tasks: (workspaceId: string, projectId: string) =>
    [...projectWorkflowKeys.all, 'tasks', workspaceId, projectId] as const,
};

export function useProjectStages(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: projectWorkflowKeys.stages(workspaceId, projectId),
    queryFn: () => fetchProjectStages(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  });
}
