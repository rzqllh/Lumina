import React from 'react';
import { Briefcase, ArrowDownToLine, TrendingUp, Camera } from 'lucide-react';
import { formatMoney } from '@/lib/money';
import { MetricTile } from '@/components/ui/metric-tile';
import type { WorkspaceSummaryMetrics } from '../types';

/**
 * DASH-004 — WorkspaceMetricsGrid
 * Uses existing metrics only. No new analytics or fabricated data.
 * Canonical fields: activeProjectsCount, unpaidReceivablesTotal,
 *   receivedRevenueTotal, sessionsScheduledThisMonth.
 * Improve: hierarchy, numeric typography, compactness, semantic accent.
 */

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-border bg-surface-muted/60"
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

  const tiles = [
    {
      label: 'Active Projects',
      value: String(activeProjectsCount),
      icon: Briefcase,
      accent: 'primary' as const,
      testId: 'metric-active-projects',
    },
    {
      label: 'Receivables',
      value: formatMoney(unpaidReceivablesTotal, currency),
      icon: ArrowDownToLine,
      accent: 'warning' as const,
      testId: 'metric-unpaid-receivables',
    },
    {
      label: 'Revenue',
      value: formatMoney(receivedRevenueTotal, currency),
      icon: TrendingUp,
      accent: 'success' as const,
      testId: 'metric-received-revenue',
    },
    {
      label: 'Shoots This Month',
      value: String(sessionsScheduledThisMonth),
      icon: Camera,
      accent: 'info' as const,
      testId: 'metric-monthly-shoots',
    },
  ];

  return (
    <div data-testid="workspace-metrics-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tiles.map((tile) => (
        <MetricTile
          key={tile.testId}
          label={tile.label}
          value={tile.value}
          icon={tile.icon}
          accent={tile.accent}
          testId={tile.testId}
        />
      ))}
    </div>
  );
};
