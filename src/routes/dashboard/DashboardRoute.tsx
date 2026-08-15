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
      {/* Editorial Studio Intro & Quick Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border-subtle/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            <span>{todayLabel}</span>
            <span className="text-text-muted">·</span>
            <span>{currentWorkspace?.name || 'Lumina Studio'}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Welcome back, {userName}
          </h1>

          <p className="text-xs text-text-secondary">
            {attentionCount > 0 ? (
              <span className="font-medium text-text-primary">
                <span className="text-status-danger font-bold">
                  {attentionCount} {attentionCount === 1 ? 'item requires' : 'items require'}
                </span>{' '}
                your attention today.
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Sparkles className="h-3.5 w-3.5 text-status-success" />
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
          className="flex items-center justify-between rounded-2xl border border-status-danger/30 bg-rose-500/10 p-4 text-xs text-status-danger"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="font-medium">
              {error instanceof Error ? error.message : 'Failed to load workspace dashboard data'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-[11px] font-bold underline cursor-pointer hover:opacity-80"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Level 3: Workspace Health Metrics (Compact Supporting Snapshot) */}
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

      {/* Main Operational Cockpit: 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Primary Operational Urgency & Workflow Focus */}
        <div className="lg:col-span-2 space-y-6">
          {/* Level 1: Needs Attention (Overdue deliverables, overdue payments, revision requests) */}
          <NeedsAttentionCard items={data?.attentionItems || []} isLoading={isLoading} />

          {/* Level 1/2: Today's Schedule (Shoots today, tasks due today, payments expected today) */}
          <TodayAgendaCard items={data?.todayItems || []} isLoading={isLoading} />

          {/* Level 2: Active Projects Matrix */}
          <ActiveProjectsGrid projects={data?.activeProjects || []} isLoading={isLoading} />
        </div>

        {/* Right 1 Col: Operational Horizon & Upcoming Shoots */}
        <div className="space-y-6">
          {/* Level 2: Upcoming Shoots on Horizon */}
          <UpcomingSessionsCard sessions={data?.upcomingSessions || []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
