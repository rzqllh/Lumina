import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/lib/auth';
import { fetchProjectServices } from '../api/projectServicesApi';
import type { ProjectService } from '../types/projectPricingTypes';

export function projectServicesQueryKey(workspaceId: string, projectId: string) {
  return ['projectPricing', 'services', workspaceId, projectId] as const;
}

export function useProjectServices(projectId: string | undefined) {
  const { workspaceId } = useWorkspace();
  const wsId = workspaceId ?? '';

  return useQuery<ProjectService[], Error>({
    queryKey: projectServicesQueryKey(wsId, projectId ?? ''),
    queryFn: () => fetchProjectServices(wsId, projectId!),
    enabled: Boolean(wsId && projectId),
    staleTime: 30_000,
  });
}
