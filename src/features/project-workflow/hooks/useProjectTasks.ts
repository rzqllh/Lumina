import { useQuery } from '@tanstack/react-query';
import { fetchProjectTasks } from '../api/projectTasksApi';
import { projectWorkflowKeys } from './useProjectStages';

export function useProjectTasks(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: projectWorkflowKeys.tasks(workspaceId, projectId),
    queryFn: () => fetchProjectTasks(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  });
}
