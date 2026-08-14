import { useQuery } from '@tanstack/react-query';
import { fetchProjectSessions } from '../api/sessionsApi';

export const sessionKeys = {
  all: ['sessions'] as const,
  project: (workspaceId: string, projectId: string) =>
    [...sessionKeys.all, 'project', workspaceId, projectId] as const,
  detail: (workspaceId: string, projectId: string, sessionId: string) =>
    [...sessionKeys.all, 'detail', workspaceId, projectId, sessionId] as const,
};

export function useProjectSessions(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: sessionKeys.project(workspaceId, projectId),
    queryFn: () => fetchProjectSessions(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  });
}
