import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/lib/auth';
import { fetchProjects } from '../api/projectsApi';
import type { ProjectWithClient } from '../types/projectTypes';

export function useProjects(statusFilter?: string) {
  const { workspaceId } = useWorkspace();

  return useQuery<ProjectWithClient[], Error>({
    queryKey: ['projects', workspaceId, { statusFilter }],
    queryFn: () => {
      if (!workspaceId) return Promise.resolve([]);
      return fetchProjects(workspaceId, statusFilter);
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
