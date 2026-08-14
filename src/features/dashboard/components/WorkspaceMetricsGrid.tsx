import React from 'react';
import { Briefcase, Receipt, TrendingUp, Camera } from 'lucide-react';
import { formatMoney } from '@/lib/money';
import type { WorkspaceSummaryMetrics } from '../types';

interface WorkspaceMetricsGridProps {
  metrics: WorkspaceSummaryMetrics;
  currency?: string;
  isLoading?: boolean;
}

export const WorkspaceMetricsGrid: React.FC<WorkspaceMetricsGridProps> = ({
  metrics,
  currency = 'IDR',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-border bg-surface-muted/50"
          />
        ))}
      </div>
    );
  }

  const {
    activeProjectsCount,
    unpaidReceivablesTotal,
    receivedRevenueTotal,
    sessionsScheduledThisMonth,
  } = metrics;

  return (
    <div data-testid="workspace-metrics-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Active Projects */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xs space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Briefcase className="h-3.5 w-3.5 text-primary" />
          <span>Active Projects</span>
        </div>
        <p data-testid="metric-active-projects" className="text-xl font-bold text-text-primary">
          {activeProjectsCount}
        </p>
      </div>

      {/* Unpaid Receivables */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xs space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Receipt className="h-3.5 w-3.5 text-amber-600" />
          <span>Receivables</span>
        </div>
        <p data-testid="metric-unpaid-receivables" className="text-xl font-bold text-amber-700">
          {formatMoney(unpaidReceivablesTotal, currency)}
        </p>
      </div>

      {/* Received Revenue */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xs space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          <span>Received Revenue</span>
        </div>
        <p data-testid="metric-received-revenue" className="text-xl font-bold text-emerald-700">
          {formatMoney(receivedRevenueTotal, currency)}
        </p>
      </div>

      {/* Shoots This Month */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xs space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Camera className="h-3.5 w-3.5 text-indigo-600" />
          <span>Shoots This Month</span>
        </div>
        <p data-testid="metric-monthly-shoots" className="text-xl font-bold text-indigo-700">
          {sessionsScheduledThisMonth}
        </p>
      </div>
    </div>
  );
};
