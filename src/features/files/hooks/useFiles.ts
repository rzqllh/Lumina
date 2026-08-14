import { useQuery } from '@tanstack/react-query';
import { fetchProjectFileReferences, getPublicProjectStatusRpc } from '../api/filesApi';

export const fileKeys = {
  all: ['files'] as const,
  list: (workspaceId: string, projectId: string) =>
    [...fileKeys.all, 'list', workspaceId, projectId] as const,
  publicStatus: (token: string) => [...fileKeys.all, 'publicStatus', token] as const,
};

export function useProjectFileReferences(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: fileKeys.list(workspaceId, projectId),
    queryFn: () => fetchProjectFileReferences(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  });
}

export function usePublicProjectStatus(token: string | undefined) {
  return useQuery({
    queryKey: fileKeys.publicStatus(token || ''),
    queryFn: () => getPublicProjectStatusRpc(token!),
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}
