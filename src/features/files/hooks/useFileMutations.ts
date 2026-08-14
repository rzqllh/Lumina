import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createFileReference,
  updateFileReference,
  deleteFileReference,
  generateProjectStatusShareLinkRpc,
  revokeProjectShareLinkRpc,
} from '../api/filesApi';
import { fileKeys } from './useFiles';
import type { CreateFileReferenceInput, UpdateFileReferenceInput } from '../types';

export function useCreateFileReference(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFileReferenceInput) => createFileReference(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fileKeys.list(workspaceId, projectId),
      });
    },
  });
}

export function useUpdateFileReference(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, input }: { fileId: string; input: UpdateFileReferenceInput }) =>
      updateFileReference(fileId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fileKeys.list(workspaceId, projectId),
      });
    },
  });
}

export function useDeleteFileReference(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => deleteFileReference(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fileKeys.list(workspaceId, projectId),
      });
    },
  });
}

export function useGenerateProjectStatusShareLink() {
  return useMutation({
    mutationFn: (projectId: string) => generateProjectStatusShareLinkRpc(projectId),
  });
}

export function useRevokeProjectShareLink(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => revokeProjectShareLinkRpc(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fileKeys.list(workspaceId, projectId),
      });
    },
  });
}
