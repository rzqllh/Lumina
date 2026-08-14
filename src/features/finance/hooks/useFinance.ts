import { useQuery } from '@tanstack/react-query';
import {
  fetchProjectPayments,
  fetchProjectExpenses,
  fetchWorkspaceCollaborators,
  fetchProjectCollaboratorEngagements,
} from '../api/financeApi';
import { useProjectServices } from '@/features/project-pricing';
import { useProjectDeliverables } from '@/features/deliverables';
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

  const contractValue = services.reduce(
    (acc, s) => acc + (s.unit_price || 0) * (s.quantity || 1),
    0
  );

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const remainingBalance = Math.max(0, contractValue - totalPaid);

  const genericExpensesTotal = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const collaboratorFeesTotal = engagements.reduce((acc, c) => acc + (c.agreed_fee || 0), 0);
  const totalExpenses = genericExpensesTotal + collaboratorFeesTotal;

  const netProfit = contractValue - totalExpenses;
  const profitMarginPercent = contractValue > 0 ? Math.round((netProfit / contractValue) * 100) : 0;

  const isFullyPaid =
    contractValue > 0 ? totalPaid >= contractValue : payments.length > 0 && remainingBalance === 0;

  const allDeliverablesApproved =
    deliverables.length === 0 || deliverables.every((d) => d.status === 'approved');

  const canNormalClose = isFullyPaid && allDeliverablesApproved;

  const summary: ProjectFinancialSummary = {
    contractValue,
    totalPaid,
    remainingBalance,
    totalExpenses,
    genericExpensesTotal,
    collaboratorFeesTotal,
    netProfit,
    profitMarginPercent,
    isFullyPaid,
    canNormalClose,
  };

  const isLoading =
    isServicesLoading ||
    isPaymentsLoading ||
    isExpensesLoading ||
    isEngagementsLoading ||
    isDeliverablesLoading;

  return { summary, isLoading };
}
