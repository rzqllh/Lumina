import { useWorkspace } from '@/lib/auth';
import {
  useDashboardData,
  NeedsAttentionCard,
  TodayAgendaCard,
  WorkspaceMetricsGrid,
  ActiveProjectsGrid,
  UpcomingSessionsCard,
} from '@/features/dashboard';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * DashboardRoute
 * DASH-001: Clean overview header + date context + factual attention summary (no generic greeting fluff)
 * DASH-002–006: Operational modules
 * DASH-007: Desktop composition — 2/3 + 1/3 layout, not a narrow mobile column
 * Priority: Needs Attention > Today > Active Projects > Upcoming Sessions > Metrics
 */
export function DashboardRoute() {
  const { workspaceId } = useWorkspace();

  const wsId = workspaceId ?? '';
  const { data, isLoading, error, refetch } = useDashboardData(wsId);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const attentionCount = data?.attentionItems?.length || 0;

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Page Header: Clean Overview + Date Context */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
              Overview
            </h1>
            <span className="text-xs text-text-muted tabular-nums">{todayLabel}</span>
          </div>

          {/* Operational Attention Summary (Factual only, no cheerleading) */}
          <p className="mt-1 text-xs text-text-secondary">
            {attentionCount > 0 ? (
              <span className="font-medium text-text-primary">
                <span className="text-status-danger-text font-semibold">
                  {attentionCount} {attentionCount === 1 ? 'item requires' : 'items require'}
                </span>{' '}
                attention
              </span>
            ) : (
              <span>No items require attention</span>
            )}
          </p>
        </div>
      </div>

      {/* Global Query Error */}
      {error && (
        <div
          role="alert"
          data-testid="dashboard-error"
          className="flex items-center justify-between rounded-xl border p-4 text-xs bg-status-danger-subtle text-status-danger-text border-status-danger-border"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <p className="font-medium">
              {error instanceof Error ? error.message : 'Failed to load workspace dashboard data'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-[11px] font-bold underline cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" strokeWidth={2} />
            Retry
          </button>
        </div>
      )}

      {/* DASH-004 — Workspace Metrics (Level 3: supporting) */}
      <WorkspaceMetricsGrid
        metrics={
          data?.metrics || {
            activeProjectsCount: 0,
            unpaidReceivablesTotal: 0,
            receivedRevenueTotal: 0,
            sessionsScheduledThisMonth: 0,
          }
        }
        isLoading={isLoading}
      />

      {/*
        DASH-007 — Desktop Composition
        Mobile: single column (natural stack)
        Tablet+: 2-column operational cockpit — left 2/3 primary urgency, right 1/3 horizon
        Desktop: uses available width intentionally — not a stretched mobile column
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Primary operational urgency + workflow focus (2/3) */}
        <div className="lg:col-span-2 space-y-5">
          {/* DASH-002 — Needs Attention (Level 1: focal) */}
          <NeedsAttentionCard items={data?.attentionItems || []} isLoading={isLoading} />

          {/* DASH-003 — Today's Schedule (Level 1/2) */}
          <TodayAgendaCard items={data?.todayItems || []} isLoading={isLoading} />

          {/* DASH-005 — Active Projects (Level 2) */}
          <ActiveProjectsGrid projects={data?.activeProjects || []} isLoading={isLoading} />
        </div>

        {/* Right — Operational horizon + upcoming shoots (1/3) */}
        <div className="space-y-5">
          {/* DASH-006 — Upcoming Sessions */}
          <UpcomingSessionsCard sessions={data?.upcomingSessions || []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
