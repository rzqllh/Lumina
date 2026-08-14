import { useQuery } from '@tanstack/react-query';
import { fetchProjectDeliverables } from '../api/deliverablesApi';

export const deliverableKeys = {
  all: ['deliverables'] as const,
  project: (workspaceId: string, projectId: string) =>
    [...deliverableKeys.all, 'project', workspaceId, projectId] as const,
  detail: (workspaceId: string, projectId: string, deliverableId: string) =>
    [...deliverableKeys.all, 'detail', workspaceId, projectId, deliverableId] as const,
};

export function useProjectDeliverables(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: deliverableKeys.project(workspaceId, projectId),
    queryFn: () => fetchProjectDeliverables(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  });
}
