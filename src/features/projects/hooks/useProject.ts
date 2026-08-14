import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/lib/auth';
import { fetchProjectById } from '../api/projectsApi';
import type { ProjectWithClient } from '../types/projectTypes';

export function useProject(projectId: string | undefined) {
  const { workspaceId } = useWorkspace();

  return useQuery<ProjectWithClient | null, Error>({
    queryKey: ['project', workspaceId, projectId],
    queryFn: () => {
      if (!workspaceId || !projectId) return Promise.resolve(null);
      return fetchProjectById(workspaceId, projectId);
    },
    enabled: !!workspaceId && !!projectId,
    staleTime: 1000 * 60 * 2,
  });
}
