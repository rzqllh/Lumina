import { useWorkspace, useAuth } from '@/lib/auth';
import {
  useDashboardData,
  NeedsAttentionCard,
  TodayAgendaCard,
  WorkspaceMetricsGrid,
  ActiveProjectsGrid,
  QuickActionBar,
  UpcomingSessionsCard,
} from '@/features/dashboard';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

/**
 * DashboardRoute
 * DASH-001: Greeting + date context + New Project + Add Client (QuickActionBar)
 * DASH-002–006: Operational modules
 * DASH-007: Desktop composition — 2/3 + 1/3 layout, not a narrow mobile column
 * Priority: Needs Attention > Today > Active Projects > Upcoming Sessions > Metrics
 */
export function DashboardRoute() {
  const { workspaceId, currentWorkspace } = useWorkspace();
  const { user } = useAuth();

  const wsId = workspaceId ?? '';
  const { data, isLoading, error, refetch } = useDashboardData(wsId);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Creator';

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const attentionCount = data?.attentionItems?.length || 0;

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* DASH-001 — Intro: greeting, date, workspace context, quick actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border-subtle pb-5">
        <div className="space-y-1">
          {/* Eyebrow — date + workspace context */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            <span
              className="flex h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: 'var(--color-primary)' }}
              aria-hidden="true"
            />
            <span className="tabular-nums">{todayLabel}</span>
            <span className="text-text-muted" aria-hidden="true">
              ·
            </span>
            <span>{currentWorkspace?.name || 'Lumina Studio'}</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-text-primary leading-tight">
            Welcome back, {userName}
          </h1>

          {/* Attention context — honest only */}
          <p className="text-xs text-text-secondary">
            {attentionCount > 0 ? (
              <span className="font-medium text-text-primary">
                <span className="text-status-danger-text font-bold">
                  {attentionCount} {attentionCount === 1 ? 'item requires' : 'items require'}
                </span>{' '}
                your attention today.
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Sparkles className="h-3.5 w-3.5 text-status-success-text" strokeWidth={1.75} />
                <span>All active projects and schedules are on track.</span>
              </span>
            )}
          </p>
        </div>

        <QuickActionBar />
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
