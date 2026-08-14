import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createDeliverable,
  updateDeliverable,
  updateDeliverableStatus,
  deleteDeliverable,
} from '../api/deliverablesApi';
import { createDeliverableRevision, updateRevision } from '../api/revisionsApi';
import { deliverableKeys } from './useDeliverables';
import type {
  CreateDeliverableInput,
  UpdateDeliverableInput,
  DeliverableStatus,
  CreateRevisionInput,
  UpdateRevisionInput,
} from '../types';

export function useCreateDeliverable(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateDeliverableInput, 'workspace_id' | 'project_id'>) =>
      createDeliverable({
        ...input,
        workspace_id: workspaceId,
        project_id: projectId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: deliverableKeys.project(workspaceId, projectId),
      });
    },
  });
}

export function useUpdateDeliverable(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deliverableId,
      input,
    }: {
      deliverableId: string;
      input: UpdateDeliverableInput;
    }) => updateDeliverable(workspaceId, projectId, deliverableId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: deliverableKeys.project(workspaceId, projectId),
      });
    },
  });
}

export function useUpdateDeliverableStatus(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deliverableId, status }: { deliverableId: string; status: DeliverableStatus }) =>
      updateDeliverableStatus(workspaceId, projectId, deliverableId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: deliverableKeys.project(workspaceId, projectId),
      });
    },
  });
}

export function useDeleteDeliverable(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deliverableId: string) => deleteDeliverable(workspaceId, projectId, deliverableId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: deliverableKeys.project(workspaceId, projectId),
      });
    },
  });
}

export function useCreateRevision(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRevisionInput) => createDeliverableRevision(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: deliverableKeys.project(workspaceId, projectId),
      });
    },
  });
}

export function useUpdateRevision(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deliverableId,
      revisionId,
      input,
    }: {
      deliverableId: string;
      revisionId: string;
      input: UpdateRevisionInput;
    }) => updateRevision(workspaceId, deliverableId, revisionId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: deliverableKeys.project(workspaceId, projectId),
      });
    },
  });
}
