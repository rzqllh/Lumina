import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSession,
  updateSession,
  updateSessionStatus,
  deleteSession,
} from '../api/sessionsApi';
import { sessionKeys } from './useSessions';
import type { CreateSessionInput, UpdateSessionInput, SessionStatus } from '../types';

export function useCreateSession(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateSessionInput, 'workspace_id' | 'project_id'>) =>
      createSession({
        ...input,
        workspace_id: workspaceId,
        project_id: projectId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.project(workspaceId, projectId),
      });
    },
  });
}

export function useUpdateSession(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, input }: { sessionId: string; input: UpdateSessionInput }) =>
      updateSession(workspaceId, projectId, sessionId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.project(workspaceId, projectId),
      });
    },
  });
}

export function useUpdateSessionStatus(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: string; status: SessionStatus }) =>
      updateSessionStatus(workspaceId, projectId, sessionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.project(workspaceId, projectId),
      });
    },
  });
}

export function useDeleteSession(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => deleteSession(workspaceId, projectId, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.project(workspaceId, projectId),
      });
    },
  });
}
