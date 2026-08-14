import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPayment,
  updatePayment,
  deletePayment,
  createExpense,
  updateExpense,
  deleteExpense,
  createCollaboratorEngagement,
  updateCollaboratorEngagement,
  deleteCollaboratorEngagement,
  closeProjectRpc,
  forceCloseProjectRpc,
  reopenProjectRpc,
} from '../api/financeApi';
import { financeKeys } from './useFinance';
import type {
  CreatePaymentInput,
  UpdatePaymentInput,
  CreateExpenseInput,
  UpdateExpenseInput,
  CreateCollaboratorEngagementInput,
  UpdateCollaboratorEngagementInput,
} from '../types';

export function useCreatePayment(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreatePaymentInput, 'workspace_id' | 'project_id'>) =>
      createPayment({
        ...input,
        workspace_id: workspaceId,
        project_id: projectId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: financeKeys.payments(workspaceId, projectId),
      });
    },
  });
}

export function useUpdatePayment(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, input }: { paymentId: string; input: UpdatePaymentInput }) =>
      updatePayment(workspaceId, projectId, paymentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: financeKeys.payments(workspaceId, projectId),
      });
    },
  });
}

export function useDeletePayment(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => deletePayment(workspaceId, projectId, paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: financeKeys.payments(workspaceId, projectId),
      });
    },
  });
}

export function useCreateExpense(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateExpenseInput, 'workspace_id' | 'project_id'>) =>
      createExpense({
        ...input,
        workspace_id: workspaceId,
        project_id: projectId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: financeKeys.expenses(workspaceId, projectId),
      });
    },
  });
}

export function useUpdateExpense(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, input }: { expenseId: string; input: UpdateExpenseInput }) =>
      updateExpense(workspaceId, projectId, expenseId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: financeKeys.expenses(workspaceId, projectId),
      });
    },
  });
}

export function useDeleteExpense(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: string) => deleteExpense(workspaceId, projectId, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: financeKeys.expenses(workspaceId, projectId),
      });
    },
  });
}

export function useCreateCollaboratorEngagement(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateCollaboratorEngagementInput, 'workspace_id' | 'project_id'>) =>
      createCollaboratorEngagement({
        ...input,
        workspace_id: workspaceId,
        project_id: projectId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: financeKeys.collaboratorEngagements(workspaceId, projectId),
      });
    },
  });
}

export function useUpdateCollaboratorEngagement(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      engagementId,
      input,
    }: {
      engagementId: string;
      input: UpdateCollaboratorEngagementInput;
    }) => updateCollaboratorEngagement(workspaceId, projectId, engagementId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: financeKeys.collaboratorEngagements(workspaceId, projectId),
      });
    },
  });
}

export function useDeleteCollaboratorEngagement(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (engagementId: string) =>
      deleteCollaboratorEngagement(workspaceId, projectId, engagementId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: financeKeys.collaboratorEngagements(workspaceId, projectId),
      });
    },
  });
}

// ── Project Closure Mutations ────────────────────────────────────────────────

export function useCloseProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => closeProjectRpc(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useForceCloseProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => forceCloseProjectRpc(projectId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useReopenProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reopenProjectRpc(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
