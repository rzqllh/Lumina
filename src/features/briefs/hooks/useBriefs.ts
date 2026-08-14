import { useQuery } from '@tanstack/react-query';
import {
  fetchProjectBrief,
  fetchBriefSubmissions,
  fetchWorkspaceBriefTemplates,
  getPublicBriefIntakeRpc,
} from '../api/briefsApi';

export const briefKeys = {
  all: ['briefs'] as const,
  detail: (workspaceId: string, projectId: string) =>
    [...briefKeys.all, 'detail', workspaceId, projectId] as const,
  submissions: (briefId: string) => [...briefKeys.all, 'submissions', briefId] as const,
  templates: (workspaceId: string) => [...briefKeys.all, 'templates', workspaceId] as const,
  publicIntake: (token: string) => [...briefKeys.all, 'publicIntake', token] as const,
};

export function useProjectBrief(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: briefKeys.detail(workspaceId, projectId),
    queryFn: () => fetchProjectBrief(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  });
}

export function useBriefSubmissions(briefId: string | undefined) {
  return useQuery({
    queryKey: briefKeys.submissions(briefId || ''),
    queryFn: () => fetchBriefSubmissions(briefId!),
    enabled: Boolean(briefId),
  });
}

export function useWorkspaceBriefTemplates(workspaceId: string) {
  return useQuery({
    queryKey: briefKeys.templates(workspaceId),
    queryFn: () => fetchWorkspaceBriefTemplates(workspaceId),
    enabled: Boolean(workspaceId),
  });
}

export function usePublicBriefIntake(token: string | undefined) {
  return useQuery({
    queryKey: briefKeys.publicIntake(token || ''),
    queryFn: () => getPublicBriefIntakeRpc(token!),
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}
