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
            className="h-[72px] animate-pulse rounded-[var(--radius-card)] border border-border bg-surface-muted/50"
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
      iconColor: 'text-primary',
      testId: 'metric-active-projects',
    },
    {
      label: 'Receivables',
      value: formatMoney(unpaidReceivablesTotal, currency),
      icon: Receipt,
      iconColor: 'text-status-warning',
      testId: 'metric-unpaid-receivables',
    },
    {
      label: 'Revenue',
      value: formatMoney(receivedRevenueTotal, currency),
      icon: TrendingUp,
      iconColor: 'text-status-success',
      testId: 'metric-received-revenue',
    },
    {
      label: 'Shoots This Month',
      value: String(sessionsScheduledThisMonth),
      icon: Camera,
      iconColor: 'text-status-info',
      testId: 'metric-monthly-shoots',
    },
  ];

  return (
    <div data-testid="workspace-metrics-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.testId}
            className="rounded-[var(--radius-card)] border border-border bg-surface p-3.5 space-y-1"
          >
            <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Icon className={`h-3.5 w-3.5 ${item.iconColor}`} />
              <span>{item.label}</span>
            </div>
            <p
              data-testid={item.testId}
              className="text-lg font-bold text-text-primary tabular-nums"
            >
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};
