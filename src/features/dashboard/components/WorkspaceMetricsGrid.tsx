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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-border/60 bg-surface-muted/40"
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

  const items = [
    {
      label: 'Active Projects',
      value: String(activeProjectsCount),
      icon: Briefcase,
      badgeColor: 'bg-primary/10 text-primary',
      testId: 'metric-active-projects',
    },
    {
      label: 'Receivables',
      value: formatMoney(unpaidReceivablesTotal, currency),
      icon: Receipt,
      badgeColor: 'bg-amber-500/10 text-status-warning',
      testId: 'metric-unpaid-receivables',
    },
    {
      label: 'Revenue',
      value: formatMoney(receivedRevenueTotal, currency),
      icon: TrendingUp,
      badgeColor: 'bg-emerald-500/10 text-status-success',
      testId: 'metric-received-revenue',
    },
    {
      label: 'Shoots This Month',
      value: String(sessionsScheduledThisMonth),
      icon: Camera,
      badgeColor: 'bg-sky-500/10 text-status-info',
      testId: 'metric-monthly-shoots',
    },
  ];

  return (
    <div
      data-testid="workspace-metrics-grid"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.testId}
            className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-3.5 sm:p-4 transition-all duration-[var(--transition-fast)] hover:border-border-interactive/60 hover:shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                {item.label}
              </span>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-lg ${item.badgeColor} transition-transform duration-[var(--transition-fast)] group-hover:scale-105`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="mt-2.5">
              <p
                data-testid={item.testId}
                className="text-lg sm:text-xl font-bold tracking-tight text-text-primary tabular-nums"
              >
                {item.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
