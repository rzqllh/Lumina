import type { ProjectService } from '@/features/project-pricing';
import type { Deliverable } from '@/features/deliverables';
import type { Payment, Expense, CollaboratorEngagement, ProjectFinancialSummary } from '../types';

export interface RawFinanceInputs {
  services: (Pick<ProjectService, 'unit_price' | 'quantity'> & {
    subtotal?: number;
    adjustment_amount?: number;
  })[];
  payments: Pick<Payment, 'amount' | 'status'>[];
  expenses?: Pick<Expense, 'amount'>[];
  collaboratorEngagements?: Pick<CollaboratorEngagement, 'agreed_fee'>[];
  deliverables?: Pick<Deliverable, 'status'>[];
}

/**
 * Computes canonical project financial metrics according to Lumina Domain Model:
 *
 * Project Value = SUM(Project Service net line totals)
 * Paid Amount   = SUM(Payment.amount WHERE status = 'paid')
 * Receivable    = Project Value - Paid Amount (can be negative for overpayments)
 * Generic Expenses = SUM(Expense.amount)
 * Committed Crew Cost = SUM(CollaboratorEngagement.agreed_fee)
 * Total Project Cost  = Generic Expenses + Committed Crew Cost
 * Projected Profit    = Project Value - Total Project Cost
 * Margin %            = (Projected Profit / Project Value) * 100
 */
export function calculateFinancialSummary(inputs: RawFinanceInputs): ProjectFinancialSummary {
  const {
    services = [],
    payments = [],
    expenses = [],
    collaboratorEngagements = [],
    deliverables = [],
  } = inputs;

  // 1. Contract / Project Value = SUM of (unit_price * quantity + adjustment_amount)
  const contractValue = services.reduce((acc, s) => {
    const subtotal = s.subtotal ?? (s.unit_price || 0) * (s.quantity || 1);
    const adjustment = s.adjustment_amount || 0;
    return acc + subtotal + adjustment;
  }, 0);

  // 2. Paid Revenue = SUM of paid payments
  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  // 3. Receivable = Project Value - Paid Revenue (exact formula without clamping)
  const remainingBalance = contractValue - totalPaid;

  // 4. Costs
  const genericExpensesTotal = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const collaboratorFeesTotal = collaboratorEngagements.reduce(
    (acc, c) => acc + (c.agreed_fee || 0),
    0
  );
  const totalExpenses = genericExpensesTotal + collaboratorFeesTotal;

  // 5. Profit & Margin
  const netProfit = contractValue - totalExpenses;
  const profitMarginPercent = contractValue > 0 ? Math.round((netProfit / contractValue) * 100) : 0;

  // 6. Closure conditions
  const isFullyPaid =
    contractValue > 0 ? totalPaid >= contractValue : payments.length > 0 && remainingBalance === 0;

  const allDeliverablesApproved =
    deliverables.length === 0 || deliverables.every((d) => d.status === 'approved');

  const canNormalClose = isFullyPaid && allDeliverablesApproved;

  return {
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
}
