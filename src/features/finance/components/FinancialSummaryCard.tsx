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
      <div className="h-28 animate-pulse rounded-2xl border border-border bg-surface-muted/50" />
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
      className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-4"
    >
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Contract Value */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Coins className="h-3.5 w-3.5 text-primary" />
            <span>Contract Value</span>
          </div>
          <p
            data-testid="metric-contract-value"
            className="text-base sm:text-lg font-bold text-text-primary"
          >
            {formatMoney(contractValue, currency)}
          </p>
        </div>

        {/* Total Paid */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Received</span>
          </div>
          <p
            data-testid="metric-total-paid"
            className="text-base sm:text-lg font-bold text-emerald-700"
          >
            {formatMoney(totalPaid, currency)}
          </p>
        </div>

        {/* Remaining Balance */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <AlertTriangle
              className={`h-3.5 w-3.5 ${
                remainingBalance > 0 ? 'text-amber-600' : 'text-text-muted'
              }`}
            />
            <span>Balance Due</span>
          </div>
          <p
            data-testid="metric-remaining-balance"
            className={`text-base sm:text-lg font-bold ${
              remainingBalance > 0 ? 'text-amber-700' : 'text-text-secondary'
            }`}
          >
            {formatMoney(remainingBalance, currency)}
          </p>
        </div>

        {/* Net Profit & Margin */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
            <span>Net Profit ({profitMarginPercent}%)</span>
          </div>
          <p
            data-testid="metric-net-profit"
            className={`text-base sm:text-lg font-bold ${
              netProfit >= 0 ? 'text-indigo-700' : 'text-rose-700'
            }`}
          >
            {formatMoney(netProfit, currency)}
          </p>
        </div>
      </div>

      {/* Progress & Cost Breakdown Bar */}
      <div className="space-y-2 border-t border-border-subtle pt-3">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="font-medium">Payment Collection ({collectionPercent}%)</span>
          <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span className="flex items-center gap-1">
              <Receipt className="h-3 w-3" />
              Direct Costs: {formatMoney(genericExpensesTotal, currency)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
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
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${collectionPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
