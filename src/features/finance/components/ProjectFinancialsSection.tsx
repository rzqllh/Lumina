import React, { useState } from 'react';
import { CreditCard, Receipt, Users } from 'lucide-react';
import { FinancialSummaryCard } from './FinancialSummaryCard';
import { PaymentsList } from './PaymentsList';
import { ExpensesList } from './ExpensesList';
import { CollaboratorEngagementsList } from './CollaboratorEngagementsList';
import {
  useProjectFinancialSummary,
  useProjectPayments,
  useProjectExpenses,
  useProjectCollaboratorEngagements,
} from '../hooks';

interface ProjectFinancialsSectionProps {
  workspaceId: string;
  projectId: string;
  currency?: string;
  isForceClosed?: boolean;
}

type FinanceTab = 'payments' | 'expenses' | 'collaborators';

export const ProjectFinancialsSection: React.FC<ProjectFinancialsSectionProps> = ({
  workspaceId,
  projectId,
  currency = 'IDR',
  isForceClosed = false,
}) => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('payments');

  const { summary, isLoading: isSummaryLoading } = useProjectFinancialSummary(
    workspaceId,
    projectId
  );

  const { data: payments = [] } = useProjectPayments(workspaceId, projectId);
  const { data: expenses = [] } = useProjectExpenses(workspaceId, projectId);
  const { data: engagements = [] } = useProjectCollaboratorEngagements(workspaceId, projectId);

  return (
    <div data-testid="project-financials-section" className="space-y-5">
      {/* Top Financial Health Metrics */}
      <FinancialSummaryCard summary={summary} currency={currency} isLoading={isSummaryLoading} />

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          data-testid="tab-payments"
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'payments'
              ? 'border-primary text-primary-text'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Payment Schedule</span>
          <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary border border-border-subtle tabular-nums">
            {payments.length}
          </span>
        </button>

        <button
          type="button"
          data-testid="tab-expenses"
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'expenses'
              ? 'border-primary text-primary-text'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Receipt className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Direct Expenses</span>
          <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary border border-border-subtle tabular-nums">
            {expenses.length}
          </span>
        </button>

        <button
          type="button"
          data-testid="tab-collaborators"
          onClick={() => setActiveTab('collaborators')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'collaborators'
              ? 'border-primary text-primary-text'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Crew & Collaborators</span>
          <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary border border-border-subtle tabular-nums">
            {engagements.length}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-1">
        {activeTab === 'payments' && (
          <PaymentsList
            workspaceId={workspaceId}
            projectId={projectId}
            currency={currency}
            isForceClosed={isForceClosed}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesList
            workspaceId={workspaceId}
            projectId={projectId}
            currency={currency}
            isForceClosed={isForceClosed}
          />
        )}

        {activeTab === 'collaborators' && (
          <CollaboratorEngagementsList
            workspaceId={workspaceId}
            projectId={projectId}
            currency={currency}
            isForceClosed={isForceClosed}
          />
        )}
      </div>
    </div>
  );
};
