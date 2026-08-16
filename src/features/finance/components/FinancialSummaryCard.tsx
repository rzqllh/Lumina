import React from 'react';
import { Coins, CheckCircle2, AlertTriangle, TrendingUp, Receipt, Users } from 'lucide-react';
import { formatMoney } from '@/lib/money';
import type { ProjectFinancialSummary } from '../types';

interface FinancialSummaryCardProps {
  summary: ProjectFinancialSummary;
  currency?: string;
  isLoading?: boolean;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  summary,
  currency = 'IDR',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="h-28 animate-pulse rounded-xl border border-border bg-surface-muted/50" />
    );
  }

  const {
    contractValue,
    totalPaid,
    remainingBalance,
    totalExpenses,
    genericExpensesTotal,
    collaboratorFeesTotal,
    netProfit,
    profitMarginPercent,
  } = summary;

  const collectionPercent =
    contractValue > 0
      ? Math.min(100, Math.round((totalPaid / contractValue) * 100))
      : totalPaid > 0
        ? 100
        : 0;

  return (
    <div
      data-testid="financial-summary-card"
      className="rounded-xl border border-border bg-surface p-5 shadow-2xs space-y-4"
    >
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Contract Value */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Coins className="h-3.5 w-3.5 text-primary-text" strokeWidth={1.75} />
            <span>Contract Value</span>
          </div>
          <p
            data-testid="metric-contract-value"
            className="text-base sm:text-lg font-bold text-text-primary tabular-nums tracking-tight"
          >
            {formatMoney(contractValue, currency)}
          </p>
        </div>

        {/* Total Paid */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <CheckCircle2 className="h-3.5 w-3.5 text-status-success-text" strokeWidth={1.75} />
            <span>Received</span>
          </div>
          <p
            data-testid="metric-total-paid"
            className="text-base sm:text-lg font-bold text-status-success-text tabular-nums tracking-tight"
          >
            {formatMoney(totalPaid, currency)}
          </p>
        </div>

        {/* Remaining Balance */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <AlertTriangle
              className={`h-3.5 w-3.5 ${
                remainingBalance > 0 ? 'text-status-warning-text' : 'text-text-muted'
              }`}
              strokeWidth={1.75}
            />
            <span>Balance Due</span>
          </div>
          <p
            data-testid="metric-remaining-balance"
            className={`text-base sm:text-lg font-bold tabular-nums tracking-tight ${
              remainingBalance > 0 ? 'text-status-warning-text' : 'text-text-secondary'
            }`}
          >
            {formatMoney(remainingBalance, currency)}
          </p>
        </div>

        {/* Net Profit & Margin */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <TrendingUp className="h-3.5 w-3.5 text-primary-text" strokeWidth={1.75} />
            <span>Net Profit ({profitMarginPercent}%)</span>
          </div>
          <p
            data-testid="metric-net-profit"
            className={`text-base sm:text-lg font-bold tabular-nums tracking-tight ${
              netProfit >= 0 ? 'text-primary-text' : 'text-status-danger-text'
            }`}
          >
            {formatMoney(netProfit, currency)}
          </p>
        </div>
      </div>

      {/* Progress & Cost Breakdown Bar */}
      <div className="space-y-2 border-t border-border-subtle pt-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-text-secondary">
          <span className="font-medium">Payment Collection ({collectionPercent}%)</span>
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted tabular-nums">
            <span className="flex items-center gap-1">
              <Receipt className="h-3 w-3" strokeWidth={1.75} />
              Direct Costs: {formatMoney(genericExpensesTotal, currency)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" strokeWidth={1.75} />
              Crew Fees: {formatMoney(collaboratorFeesTotal, currency)}
            </span>
            <span className="font-semibold text-text-secondary">
              Total Costs: {formatMoney(totalExpenses, currency)}
            </span>
          </div>
        </div>

        {/* Progress Visual */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted border border-border-subtle">
          <div
            data-testid="payment-progress-fill"
            className="h-full rounded-full bg-status-success-text transition-all duration-300"
            style={{ width: `${collectionPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
