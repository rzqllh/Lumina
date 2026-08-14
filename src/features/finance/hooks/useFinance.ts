import { useQuery } from '@tanstack/react-query';
import {
  fetchProjectPayments,
  fetchProjectExpenses,
  fetchWorkspaceCollaborators,
  fetchProjectCollaboratorEngagements,
} from '../api/financeApi';
import { useProjectServices } from '@/features/project-pricing';
import { useProjectDeliverables } from '@/features/deliverables';
import { calculateFinancialSummary } from '../utils/financialCalculations';
import type { ProjectFinancialSummary } from '../types';

export const financeKeys = {
  all: ['finance'] as const,
  payments: (workspaceId: string, projectId: string) =>
    [...financeKeys.all, 'payments', workspaceId, projectId] as const,
  expenses: (workspaceId: string, projectId: string) =>
    [...financeKeys.all, 'expenses', workspaceId, projectId] as const,
  collaborators: (workspaceId: string) =>
    [...financeKeys.all, 'collaborators', workspaceId] as const,
  collaboratorEngagements: (workspaceId: string, projectId: string) =>
    [...financeKeys.all, 'collaboratorEngagements', workspaceId, projectId] as const,
};

export function useProjectPayments(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: financeKeys.payments(workspaceId, projectId),
    queryFn: () => fetchProjectPayments(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  });
}

export function useProjectExpenses(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: financeKeys.expenses(workspaceId, projectId),
    queryFn: () => fetchProjectExpenses(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  });
}

export function useWorkspaceCollaborators(workspaceId: string) {
  return useQuery({
    queryKey: financeKeys.collaborators(workspaceId),
    queryFn: () => fetchWorkspaceCollaborators(workspaceId),
    enabled: Boolean(workspaceId),
  });
}

export function useProjectCollaboratorEngagements(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: financeKeys.collaboratorEngagements(workspaceId, projectId),
    queryFn: () => fetchProjectCollaboratorEngagements(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  });
}

export function useProjectFinancialSummary(
  workspaceId: string,
  projectId: string
): {
  summary: ProjectFinancialSummary;
  isLoading: boolean;
} {
  const { data: services = [], isLoading: isServicesLoading } = useProjectServices(
    projectId,
    workspaceId
  );
  const { data: payments = [], isLoading: isPaymentsLoading } = useProjectPayments(
    workspaceId,
    projectId
  );
  const { data: expenses = [], isLoading: isExpensesLoading } = useProjectExpenses(
    workspaceId,
    projectId
  );
  const { data: engagements = [], isLoading: isEngagementsLoading } =
    useProjectCollaboratorEngagements(workspaceId, projectId);
  const { data: deliverables = [], isLoading: isDeliverablesLoading } = useProjectDeliverables(
    workspaceId,
    projectId
  );

  const summary = calculateFinancialSummary({
    services,
    payments,
    expenses,
    collaboratorEngagements: engagements,
    deliverables,
  });

  const isLoading =
    isServicesLoading ||
    isPaymentsLoading ||
    isExpensesLoading ||
    isEngagementsLoading ||
    isDeliverablesLoading;

  return { summary, isLoading };
}
